import { useEffect, useRef, useState } from 'react';
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
import RiderTopBar from './RiderTopBar';
import {
  riderDeliveryApi,
  type RiderDelivery,
} from '../../../app/lib/riderDeliveryApi';

/*
|==========================================================================
| RIDER → VERIFY DELIVERY   /rider/deliveries/:id/verify
|==========================================================================
|
| TWO STEPS, AND WHY THEY ARE TWO.
|
| This screen used to fire both calls back to back with no rider action in
| between:
|
|     await riderDeliveryApi.exchangeCode(id, code);
|     await riderDeliveryApi.confirmPayment(id);      ← fired automatically
|     navigate(`/rider/deliveries/${id}/success`);
|
| That is wrong in two separate ways.
|
| ── 1. IT SILENTLY BRICKED THE DELIVERY ──────────────────────────────────
| If `exchangeCode` succeeded and then `confirmPayment` failed — flaky signal
| at a customer's door, a 500, the phone sleeping — both calls were inside one
| try block, so the catch fired and the rider saw:
|
|     "Incorrect code. Please try again."
|
| with the six digits wiped.
|
| But the code WAS correct, and the backend had already consumed it. Re-typing
| the same code fails, every time, because it is spent. The rider is left with
| a delivery they cannot complete and an error message actively pointing them
| at the wrong thing. The only way out was to phone someone.
|
| ── 2. NOBODY CONFIRMED THE PAYMENT ──────────────────────────────────────
| `confirmPayment` is the rider saying "I have the money". Firing it
| automatically means the system recorded a payment confirmation that no human
| ever gave. The rider needs to take the cash or check the transfer FIRST, and
| only then tap. So it is a button, and it says what it is for.
|
| THE TWO STEPS NOW:
|
|   1. Enter the customer's 6-digit code  → exchangeCode
|      A wrong code is the only thing that clears the digits and says
|      "incorrect code".
|
|   2. Confirm the payment has been received → confirmPayment
|      A failure here keeps the rider ON step 2 with the code intact, says the
|      payment is what failed, and lets them retry without re-entering
|      anything. That is the whole point of the split.
|
| ⚠️ ONCE THE CODE IS ACCEPTED THERE IS NO GOING BACK. The code is spent
|    server-side; offering "back" would invite a rider to re-submit it and hit
|    a confusing failure. The back arrow leaves the screen entirely instead.
|
| ⚠️ ROUTE SEGMENTS: `exchange-code` and `confirm-payment` are what the LIVE
|    server serves. The Postman docs call them `code-exchange` and
|    `confirm-payment`, and `code-exchange` is a 404. Do not "fix" these to
|    match the docs — ask 17 proved the docs wrong and the backend has not
|    moved since. See the table in riderDeliveryApi.ts.
*/

/*
|--------------------------------------------------------------------------
| Resuming a half-finished delivery
|--------------------------------------------------------------------------
| ⚠️ THE API CANNOT TELL US THIS, so we remember it ourselves.
|
| The rider status ladder is ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED.
| Nothing in between marks "code exchanged, payment still pending" — both
| steps happen while the order sits on IN_TRANSIT — and `getAssignedDelivery`
| returns no flag for it either.
|
| So consider what used to be an unavoidable dead end: a rider exchanges the
| code, then the app is backgrounded, the phone dies, or they navigate away to
| check something. Coming back to /verify re-renders step 1, but the code has
| been consumed server-side. Re-entering it fails. The rider is stranded at a
| customer's door with a delivery they cannot finish and no way to say so.
|
| This keeps a note ON THIS DEVICE that the code for a given delivery was
| already accepted, so returning to the screen lands on step 2. Confirm Payment
| still has to genuinely succeed against the server — this skips a screen, it
| does not skip a check.
|
| sessionStorage, deliberately: it should survive a backgrounded tab or an
| accidental navigation, and it should NOT survive closing the browser or move
| to another device. A rider who abandoned a delivery yesterday should start
| at the code again.
|
| ⚠️ DELETE ALL OF THIS the moment the backend exposes the state — either an
|    idempotent `exchange-code` (re-submitting a correct code succeeds) or a
|    status such as CODE_VERIFIED / PAYMENT_PENDING on the delivery. Then read
|    it from the payload and drop these three helpers plus the two call sites.
*/
const CODE_VERIFIED_KEY = 'declan:rider-code-verified';

function readVerifiedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(CODE_VERIFIED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    // Unreadable or corrupt — behave as if nothing was verified.
    return [];
  }
}

function noteCodeVerified(deliveryId: string): void {
  try {
    const ids = readVerifiedIds();

    if (!ids.includes(deliveryId)) {
      sessionStorage.setItem(CODE_VERIFIED_KEY, JSON.stringify([...ids, deliveryId]));
    }
  } catch {
    /*
      Private mode or a full quota. The delivery still completes; the rider
      just loses the resume shortcut for this one, so this is swallowed.
    */
  }
}

function clearCodeVerified(deliveryId: string): void {
  try {
    sessionStorage.setItem(
      CODE_VERIFIED_KEY,
      JSON.stringify(readVerifiedIds().filter((v) => v !== deliveryId))
    );
  } catch {
    /* see noteCodeVerified */
  }
}

/** Matches the local helper the other rider screens use, for consistency. */
function formatAmount(amount: unknown) {
  const num = Number(amount);

  return Number.isNaN(num) || amount === null || amount === undefined
    ? '—'
    : `₦${num.toLocaleString()}`;
}

export default function DeliveryVerification() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  /*
    Which half of the flow the rider is on.

    'code'    — entering the customer's 6-digit code
    'payment' — code accepted; waiting for the rider to confirm the money is in

    There is deliberately no transition from 'payment' back to 'code'.
  */
  const [step, setStep] = useState<'code' | 'payment'>('code');

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!id) return;

    /*
      Resume straight to step 2 if this device already had the code accepted
      for this delivery. See the note on the helper block above for why the
      API cannot answer this itself.
    */
    if (readVerifiedIds().includes(id)) {
      setStep('payment');
    }

    riderDeliveryApi
      .getAssignedDelivery(id)
      .then((res) => {
        console.log('DELIVERY VERIFICATION RESPONSE:', res.data);
        setDelivery(res.data.data.delivery);
      })
      .catch((err) => {
        console.error('Failed to load delivery:', err);
      });
  }, [id]);

  const handleDigitChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[idx] = value;

    setDigits(next);
    setError('');

    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  /*
    STEP 1 — exchange the customer's code.

    The only failure handled here is a rejected code, because that is the only
    call made here. Anything that goes wrong in it is a code problem or a
    network problem, and both are recoverable by trying again.
  */
  const handleVerifyCode = async () => {
    if (!id) return;

    const code = digits.join('');

    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await riderDeliveryApi.exchangeCode(id, code);

      /*
        Code accepted. Move to the payment step — do NOT confirm the payment
        here. See the header note: that call is the rider's word that the money
        is in their hand, and only the rider can give it.
      */
      noteCodeVerified(id);
      setStep('payment');
    } catch (err: any) {
      console.error('Code verification failed:', err.response?.data ?? err);

      setError(
        err.response?.data?.message ?? 'Incorrect code. Please try again.'
      );

      // Only a failed code clears the boxes — the code really is wrong here.
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  /*
    STEP 2 — the rider confirms the payment.

    ⚠️ A failure here must NOT clear the digits or mention the code. The code
    was accepted and is spent; telling the rider to re-enter it is the exact
    bug this step exists to remove. They stay on this screen and can retry.
  */
  const handleConfirmPayment = async () => {
    if (!id) return;

    setConfirming(true);
    setError('');

    try {
      await riderDeliveryApi.confirmPayment(id);

      // Delivery done — drop the resume note so it does not accumulate.
      clearCodeVerified(id);

      navigate(`/rider/deliveries/${id}/success`);
    } catch (err: any) {
      console.error('Confirm payment failed:', err.response?.data ?? err);

      setError(
        err.response?.data?.message ??
          'Could not confirm the payment. Check your connection and try again.'
      );
    } finally {
      setConfirming(false);
    }
  };

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
              disabled={verifying}
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
              disabled={confirming}
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