import { useEffect, useState } from "react";
import { useToast } from "./Toast";
import { guestOrderApi } from "../../app/lib/guestOrderApi";
import { CheckCircle2 } from "lucide-react";

export function GuestVerifyStep({
  orderNumber,
  email,
  verifyCode,
  setVerifyCode,
  verifying,
  verifyError,
  onVerify,
}: {
  orderNumber: string;
  email:       string;
  verifyCode:  string;
  setVerifyCode: (v: string) => void;
  verifying:   boolean;
  verifyError: string;
  onVerify:    () => void;
}) {
  const { showToast } = useToast();

  // Countdown before resend is allowed
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [resending,   setResending]   = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    setResending(true);
    try {
      await guestOrderApi.resendVerification({ orderNumber, email });
      showToast('Verification email resent — check your inbox.', 'success');
      setSecondsLeft(60); // reset cooldown
    } catch (err: any) {
      showToast(
        err.response?.data?.message ?? 'Failed to resend. Please try again.',
        'error'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 size={28} className="text-primary" />
      </div>

      <p className="text-xl font-bold text-ink">Verify Your Order</p>
      <p className="max-w-sm text-sm text-ink-soft">
        We sent a verification code to{' '}
        <span className="font-semibold text-ink">{email}</span> for order{' '}
        <span className="font-semibold text-ink">{orderNumber}</span>. Enter it
        below to confirm.
      </p>

      <input
        value={verifyCode}
        onChange={(e) => setVerifyCode(e.target.value)}
        placeholder="Verification code"
        className="w-full max-w-xs rounded-full border-2 border-primary px-5 py-3 text-center text-sm outline-none"
      />

      {verifyError && (
        <p className="text-sm font-medium text-red-600">{verifyError}</p>
      )}

      <button
        type="button"
        disabled={verifying}
        onClick={onVerify}
        className="w-full max-w-xs rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {verifying ? 'Verifying...' : 'Verify Order'}
      </button>

      {/* Resend section */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-ink-soft">Didn&apos;t receive the email?</p>

        {secondsLeft > 0 ? (
          <p className="text-xs text-ink-soft">
            Resend available in{' '}
            <span className="font-semibold tabular-nums text-ink">
              {secondsLeft}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend verification email'}
          </button>
        )}
      </div>

      <p className="max-w-xs text-xs text-ink-soft">
        Also check your spam or junk folder if you don&apos;t see it in your inbox.
      </p>
    </>
  );
}