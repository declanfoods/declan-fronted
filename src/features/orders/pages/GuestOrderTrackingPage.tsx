import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import SplashLoader from '../../../components/ui/SplashLoader';
import { guestOrderApi, type GuestOrderLookup } from '../api/guestOrderApi';
import type { OrderDetailsPayload } from '../api/orderApi';
import OrderTrackingView from '../components/OrderTrackingView';
import { getOrderTimeline } from '../orderPresentation';

const lookupFailure = "We couldn't find that order. Double-check the order number and email.";

type LookupRequest = GuestOrderLookup & { fromLink: boolean };

export default function GuestOrderTrackingPage() {
  const [params] = useSearchParams();
  const { key } = useLocation();
  return (
    <GuestTrackingLookup
      key={key}
      initialOrderNumber={params.get('orderNumber') ?? ''}
      initialEmail={params.get('email') ?? ''}
    />
  );
}

function GuestTrackingLookup({ initialOrderNumber, initialEmail }: {
  initialOrderNumber: string;
  initialEmail: string;
}) {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [request, setRequest] = useState<LookupRequest | null>(() =>
    initialOrderNumber && initialEmail
      ? { orderNumber: initialOrderNumber, email: initialEmail, fromLink: true }
      : null,
  );
  const [completed, setCompleted] = useState<LookupRequest | null>(null);
  const [details, setDetails] = useState<OrderDetailsPayload | null>(null);
  const [error, setError] = useState('');
  const submitting = request !== completed;

  useEffect(() => {
    if (!request) return;
    const { orderNumber, email } = request;
    const controller = new AbortController();
    const { signal } = controller;

    async function track() {
      try {
        const { data } = await guestOrderApi.trackGuestOrder({ orderNumber, email }, signal);
        if (signal.aborted) return;
        if (data?.data?.order) setDetails(data.data);
        else setError(lookupFailure);
      } catch (error) {
        if (!signal.aborted) setError(getApiErrorMessage(error, lookupFailure));
      } finally {
        if (!signal.aborted) setCompleted(request);
      }
    }
    void track();

    return () => controller.abort();
  }, [request]);

  function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !orderNumber.trim() || !email.trim()) return;
    setError('');
    setRequest({ orderNumber: orderNumber.trim(), email: email.trim(), fromLink: false });
  }

  if (submitting && request?.fromLink) return <SplashLoader />;

  if (!details) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl">📦</p>
        <p className="text-xl font-bold text-ink">Track Your Order</p>
        <p className="max-w-sm text-sm text-ink-soft">
          Enter the order number and email from your confirmation message to see live status.
        </p>

        <form onSubmit={handleLookup} className="w-full max-w-xs space-y-3">
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number"
            required
            className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email used at checkout"
            required
            className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
          />
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Looking up...' : 'Track Order'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <OrderTrackingView
      order={details.order}
      timeline={getOrderTimeline(details)}
      mode="guest"
      onBack={() => navigate('/')}
    />
  );
}
