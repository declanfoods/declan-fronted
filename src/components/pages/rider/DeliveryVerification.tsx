import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid3x3, ShieldAlert, MapPin } from 'lucide-react';
import RiderTopBar from './RiderTopBar';
import {
  riderDeliveryApi,
  type RiderDelivery,
} from '../../../app/lib/riderDeliveryApi';

export default function DeliveryVerification() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!id) return;

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

  const handleVerify = async () => {
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

      await riderDeliveryApi.confirmPayment(id);

      navigate(`/rider/deliveries/${id}/success`);
    } catch (err: any) {
      console.error('Code verification failed:', err.response?.data ?? err);

      setError(
        err.response?.data?.message ??
          'Incorrect code. Please try again.'
      );

      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const customerName =
    delivery?.order?.customerFullname ?? 'Customer';

  const customerInitial =
    customerName.trim().charAt(0).toUpperCase() || 'C';

  const orderNumber =
    delivery?.order?.orderNumber ?? delivery?.id ?? id ?? '';

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <RiderTopBar title="Verify Delivery" />

      <main className="flex-1 px-5 pt-4">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Verify Delivery
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

        {/* Verification */}
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

        {/* Verify */}
        <button
          type="button"
          disabled={verifying}
          onClick={handleVerify}
          className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {verifying ? 'Verifying...' : 'Verify Code'}
        </button>

        <p className="mt-4 text-center text-sm font-semibold text-gray-400">
          Customer can&apos;t find code
        </p>
      </main>
    </div>
  );
}