import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid3x3,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Wallet,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import RiderTopBar from '../components/RiderTopBar';
import CustomerContactBar from './CustomerContactBar';
import { useDeliveryVerification } from './useDeliveryVerification';

function formatAmount(amount: unknown) {
  const num = Number(amount);

  return Number.isNaN(num) || amount === null || amount === undefined
    ? '—'
    : `₦${num.toLocaleString()}`;
}

export default function DeliveryVerification() {
  const { id } = useParams();
  return <VerificationScreen key={id} id={id} />;
}

function VerificationScreen({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const {
    delivery, digits, error, verifying, confirming, step, setDigit, verify, confirm, completed,
  } = useDeliveryVerification(id);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (completed && id) navigate(`/rider/deliveries/${id}/success`, { replace: true });
  }, [completed, id, navigate]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setDigit(index, value);
    if (value && index < digits.length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerifyCode = async () => {
    const verified = await verify();
    if (!verified) inputs.current[0]?.focus();
  };

  const handleConfirmPayment = () => void confirm();

  const customerName = delivery?.order?.customerFullname ?? 'Customer';

  const customerInitial =
    customerName.trim().charAt(0).toUpperCase() || 'C';

  const orderNumber =
    delivery?.order?.orderNumber ?? delivery?.id ?? id ?? '';

  /* What the rider is collecting. `totalAmount` first, falling back to subTotal. */
  const amountDue = delivery?.order?.totalAmount ?? delivery?.order?.subTotal;
  const hasAmount = Number.isFinite(Number(amountDue));

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <RiderTopBar title="Verify Delivery" />

      <main className="flex-1 px-5 pt-4">
        {/* ─── Progress: makes the two steps obvious from the first screen ─── */}
        <div className="mb-4 flex items-center gap-2">
          {(
            [
              { key: 'code', label: 'Verify code' },
              { key: 'payment', label: 'Confirm payment' },
            ] as const
          ).map(({ key, label }, index) => {
            const done = step === 'payment' && key === 'code';
            const active = step === key;

            return (
              <div key={key} className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <div
                    className={
                      'h-1 w-full rounded-full ' +
                      (done || active ? 'bg-primary' : 'bg-gray-200')
                    }
                  />
                  <span
                    className={
                      'flex items-center gap-1 text-[11px] font-semibold ' +
                      (active ? 'text-primary' : 'text-gray-400')
                    }
                  >
                    {done && <CheckCircle2 size={12} />}
                    {index + 1}. {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-3 text-lg font-bold text-gray-900">
          {step === 'code' ? 'Verify Delivery' : 'Confirm Payment'}
        </h2>

        {/* Delivery Information */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">ORDER ID</p>

              <p className="text-lg font-bold text-gray-900">
                #{orderNumber}
              </p>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-600">
              <MapPin size={12} />
              Arrived
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {customerInitial}
            </span>

            <div>
              <p className="text-sm font-bold text-gray-900">
                {customerName}
              </p>

              <p className="text-xs text-gray-400">
                Customer waiting at door
              </p>
            </div>
          </div>
        </div>
          <CustomerContactBar phoneNumber={delivery?.order?.customerPhoneNumber} />
        {/* ═══════════════ STEP 1 — the code ═══════════════ */}
        {step === 'code' && (
          <>
            <div className="mt-8 flex flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Grid3x3 size={26} />
              </span>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Enter Delivery Code
              </h3>

              <p className="mt-1 text-center text-sm text-gray-500">
                Ask the customer for the 6-digit code provided to them.
              </p>

              {/* 6 digit inputs */}
              <div className="mt-6 flex gap-2 sm:gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputs.current[idx] = el;
                    }}
                    value={digit}
                    onChange={(e) =>
                      handleDigitChange(idx, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete="one-time-code"
                    className={`h-14 w-11 rounded-xl border-2 text-center text-xl font-bold outline-none sm:w-14 ${
                      error
                        ? 'border-red-400 text-red-500'
                        : 'border-primary text-gray-900'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-500">
                  <ShieldAlert size={14} />
                  {error}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-8 flex gap-2 rounded-2xl bg-[#F3F7EE] p-4">
              <ShieldAlert
                size={16}
                className="mt-0.5 shrink-0 text-primary"
              />

              <p className="text-xs text-gray-600">
                Only complete the delivery after the customer provides
                the correct 6-digit code.
              </p>
            </div>

            <button
              type="button"
              disabled={!delivery || verifying || completed}
              onClick={handleVerifyCode}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {verifying && <Loader2 size={16} className="animate-spin" />}
              {verifying ? 'Verifying...' : 'Verify Code'}
            </button>

            <p className="mt-4 text-center text-sm font-semibold text-gray-400">
              Customer can&apos;t find code
            </p>
          </>
        )}

        {/* ═══════════════ STEP 2 — the payment ═══════════════ */}
        {step === 'payment' && (
          <>
            <div className="mt-6 flex flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 size={30} />
              </span>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Code accepted
              </h3>

              <p className="mt-1 max-w-xs text-center text-sm text-gray-500">
                Take the payment from the customer, then confirm it below to
                complete this delivery.
              </p>
            </div>

            {/* What is being collected. Only shown when the order carries it. */}
            {hasAmount && (
              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <Wallet size={14} />
                  AMOUNT TO COLLECT
                </div>

                <p className="mt-1 text-2xl font-extrabold text-primary">
                  {formatAmount(amountDue)}
                </p>
              </div>
            )}

            {error && (
              <p className="mt-4 flex items-start gap-1.5 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-600">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!delivery || confirming || completed}
              onClick={handleConfirmPayment}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {confirming && <Loader2 size={16} className="animate-spin" />}
              {confirming ? 'Confirming...' : 'Confirm Payment'}
            </button>

            {/*
              Retry copy. A failure on this step leaves the rider here with the
              code already accepted, so the button is the whole recovery path —
              nothing needs re-entering.
            */}
            <p className="mt-3 text-center text-xs text-gray-400">
              Payment not gone through? Fix it and tap Confirm Payment again —
              you do not need the code a second time.
            </p>

            {/*
              Back leaves the screen entirely. It must NOT return to step 1:
              the code has been consumed server-side, so re-submitting it would
              fail and look like a bug.
            */}
            <button
              type="button"
              onClick={() => navigate(`/rider/deliveries/${id}`)}
              className="mt-5 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-400"
            >
              <ArrowLeft size={13} />
              Back to delivery
            </button>
          </>
        )}
      </main>
    </div>
  );
}
