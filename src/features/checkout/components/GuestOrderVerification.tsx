import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { useToast } from '../../../components/ui/Toast';
import { guestCheckoutApi } from '../api/guestCheckoutApi';

const RESEND_COOLDOWN = 60;

export default function GuestOrderVerification({ orderNumber, email, onBack }: {
  orderNumber: string | null;
  email: string;
  onBack: () => void;
}) {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const [pending, setPending] = useState<'verify' | 'resend' | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!orderNumber || verified || secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [orderNumber, secondsLeft, verified]);

  async function handleVerification(action: 'verify' | 'resend') {
    if (!orderNumber || inFlight.current || (action === 'resend' && secondsLeft > 0)) return;
    if (action === 'verify' && !code.trim()) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    inFlight.current = true;
    setPending(action);
    setError('');
    try {
      if (action === 'verify') {
        await guestCheckoutApi.verify({ orderNumber, email, code: code.trim() });
        setVerified(true);
      } else {
        await guestCheckoutApi.resendVerification({ orderNumber, email });
        setSecondsLeft(RESEND_COOLDOWN);
        showToast('Verification email resent — check your inbox.', 'success');
      }
    } catch (error) {
      if (action === 'verify') {
        setError(getApiErrorMessage(error, 'Invalid or expired code.'));
      } else {
        showToast(getApiErrorMessage(error, 'Failed to resend. Please try again.'), 'error');
      }
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {verified || !orderNumber ? (
        <>
          <CheckCircle2 size={56} className="text-primary" />
          <p className="text-xl font-bold text-ink">{verified ? 'Order Confirmed!' : 'Order received'}</p>
          <p className="text-sm text-ink-soft">
            {orderNumber ? (
              <>
                Order <span className="font-semibold text-ink">{orderNumber}</span> is being processed.
                We&apos;ve sent the details to {email}.
              </>
            ) : (
              <>Check {email} for your order details.</>
            )}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Back to Home
          </button>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={28} className="text-primary" />
          </div>
          <p className="text-xl font-bold text-ink">Verify Your Order</p>
          <p className="max-w-sm text-sm text-ink-soft">
            We sent a verification code to{' '}
            <span className="font-semibold text-ink">{email}</span> for order{' '}
            <span className="font-semibold text-ink">{orderNumber}</span>. Enter it below to confirm.
          </p>

          <form
            className="flex w-full max-w-xs flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleVerification('verify');
            }}
          >
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Verification code"
              className="w-full rounded-full border-2 border-primary px-5 py-3 text-center text-sm outline-none"
            />
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={pending !== null}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending === 'verify' ? 'Verifying...' : 'Verify Order'}
            </button>
          </form>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-ink-soft">Didn&apos;t receive the email?</p>
            {secondsLeft > 0 ? (
              <p className="text-xs text-ink-soft">
                Resend available in{' '}
                <span className="font-semibold tabular-nums text-ink">{secondsLeft}s</span>
              </p>
            ) : (
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => void handleVerification('resend')}
                className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {pending === 'resend' ? 'Resending...' : 'Resend verification email'}
              </button>
            )}
          </div>

          <p className="max-w-xs text-xs text-ink-soft">
            Also check your spam or junk folder if you don&apos;t see it in your inbox.
          </p>
        </>
      )}
    </div>
  );
}
