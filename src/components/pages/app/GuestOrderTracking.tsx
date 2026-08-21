import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SplashLoader from '../../ui/SplashLoader';
import OrderTrackingView from '../../ui/OrderTrackingView';
import { guestOrderApi } from '../../../app/lib/guestOrderApi';
import type { Order, OrderTimelineEvent } from '../../../app/lib/orderApi';

export default function GuestOrderTracking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const linkOrderNumber = searchParams.get('orderNumber') ?? '';
  const linkEmail = searchParams.get('email') ?? '';

  const [orderNumber, setOrderNumber] = useState(linkOrderNumber);
  const [email, setEmail] = useState(linkEmail);

  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineEvent[]>([]);
  const [loading, setLoading] = useState(!!(linkOrderNumber && linkEmail));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTracking = async (num: string, mail: string) => {
    setError('');
    try {
      const res = await guestOrderApi.trackGuestOrder({ orderNumber: num, email: mail });
      setOrder(res.data.data.order);
      setTimeline(res.data.data.orderTimeline ?? res.data.data.order.orderTimeline ?? []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'We couldn\'t find that order. Double-check the order number and email.'
      );
      setOrder(null);
    }
  };

  useEffect(() => {
    if (linkOrderNumber && linkEmail) {
      fetchTracking(linkOrderNumber, linkEmail).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;
    setSubmitting(true);
    await fetchTracking(orderNumber, email);
    setSubmitting(false);
  };

  if (loading) return <SplashLoader />;

  if (!order) {
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
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
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
      order={order}
      timeline={timeline}
      onBack={() => navigate('/')}
      backLabel="Back to Home"
    />
  );
}