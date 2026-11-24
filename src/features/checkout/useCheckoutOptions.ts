import { useEffect, useState } from 'react';
import { addressApi, type DeliveryAddress } from '../account/api/addressApi';
import { getApiErrorMessage } from '../../app/lib/api-types';
import { paymentApi, type PaymentMethod } from './api/paymentApi';

type Options = {
  paymentMethods: PaymentMethod[];
  addresses: DeliveryAddress[];
  error: string;
};

const initialOptions: Options = { paymentMethods: [], addresses: [], error: '' };

export function useCheckoutOptions(enabled: boolean, includeAddresses: boolean) {
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(enabled);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);

    async function loadOptions() {
      const [payments, savedAddresses] = await Promise.allSettled([
        paymentApi.getPaymentMethods(signal),
        includeAddresses ? addressApi.getAddresses(signal) : null,
      ]);
      if (signal.aborted) return;

      const failure = payments.status === 'rejected' ? payments.reason
        : savedAddresses.status === 'rejected' ? savedAddresses.reason
        : null;
      setOptions({
        paymentMethods: payments.status === 'fulfilled' ? payments.value : [],
        addresses: savedAddresses.status === 'fulfilled'
          ? savedAddresses.value?.data?.data?.deliveryAddresses ?? []
          : [],
        error: failure === null ? '' : getApiErrorMessage(failure, 'Could not load checkout options.'),
      });
      setLoading(false);
    }
    void loadOptions();

    return () => controller.abort();
  }, [enabled, includeAddresses, attempt]);

  return {
    ...options,
    loading: enabled && loading,
    retry: () => setAttempt((value) => value + 1),
  };
}
