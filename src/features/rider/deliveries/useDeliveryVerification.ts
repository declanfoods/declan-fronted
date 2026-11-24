import { useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { riderDeliveryApi } from './api';
import { refreshRiderDeliveries, useAssignedDelivery } from './queries';
import { clearCodeVerified, noteCodeVerified, wasCodeVerified } from './verificationSession';

const emptyCode = () => Array<string>(6).fill('');

export function useDeliveryVerification(id: string | undefined) {
  const query = useAssignedDelivery(id);
  const delivery = query.data;
  const status = delivery?.order?.orderStatus;
  const [accepted, setAccepted] = useState(() => !!id && wasCodeVerified(id));
  const [digits, setDigits] = useState(emptyCode);
  const [actionError, setActionError] = useState('');
  const [pending, setPending] = useState<'verify' | 'confirm' | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const inFlight = useRef(false);
  const completed = confirmed || status === 'DELIVERED' || status === 'COMPLETED';
  const step = accepted || status === 'CODE_EXCHANGED' ? 'payment' : 'code';

  async function verify() {
    if (!id || !delivery || step !== 'code' || completed || inFlight.current) return false;
    const code = digits.join('');
    if (code.length !== digits.length) {
      setActionError('Please enter the full 6-digit code.');
      return false;
    }

    inFlight.current = true;
    setPending('verify');
    setActionError('');
    try {
      await riderDeliveryApi.exchangeCode(id, code);
      noteCodeVerified(id);
      setAccepted(true);
      void refreshRiderDeliveries();
      return true;
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Incorrect code. Please try again.'));
      setDigits(emptyCode());
      return false;
    } finally {
      setPending(null);
      inFlight.current = false;
    }
  }

  async function confirm() {
    if (!id || !delivery || step !== 'payment' || completed || inFlight.current) return;
    inFlight.current = true;
    setPending('confirm');
    setActionError('');
    try {
      await riderDeliveryApi.confirmPayment(id);
      clearCodeVerified(id);
      setConfirmed(true);
      void refreshRiderDeliveries();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Could not confirm the payment. Check your connection and try again.'));
    } finally {
      setPending(null);
      inFlight.current = false;
    }
  }

  return {
    delivery,
    digits,
    error: actionError || (query.isError && !delivery ? getApiErrorMessage(query.error, 'Failed to load delivery.') : ''),
    verifying: pending === 'verify',
    confirming: pending === 'confirm',
    step,
    completed,
    setDigit: (index: number, value: string) => {
      setDigits((current) => current.map((digit, position) => index === position ? value : digit));
      setActionError('');
    },
    verify,
    confirm,
  };
}
