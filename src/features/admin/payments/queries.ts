import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminPaymentApi,
  extractPaymentMethods,
  type AdminPaymentMethod,
  type CreatePaymentMethodPayload,
} from './api';

const paymentMethodsKey = ['admin', 'payments', 'payment-methods'] as const;
const toggleKey = [...paymentMethodsKey, 'toggle'] as const;

interface PaymentMethodToggle {
  id: string;
  active: boolean;
}

export function useAdminPaymentMethods() {
  return useQuery({
    queryKey: paymentMethodsKey,
    queryFn: async ({ signal }) => {
      const { data } = await adminPaymentApi.getPaymentMethods(signal);
      if (data.success === false) {
        throw new Error(data.message || 'Could not load payment methods.');
      }
      return extractPaymentMethods(data.data);
    },
  });
}

export function useCreatePaymentMethod() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePaymentMethodPayload) => {
      const { data } = await adminPaymentApi.createPaymentMethod(payload);
      if (data.success === false) {
        throw new Error(data.message || 'Could not create the payment method.');
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: paymentMethodsKey }),
  });
}

export function usePendingPaymentToggles() {
  const pending = useMutationState({
    filters: { mutationKey: toggleKey, exact: true, status: 'pending' },
    select: (mutation) => mutation.state.variables as PaymentMethodToggle,
  });
  return new Map(pending.map(({ id, active }) => [id, active]));
}

export function useTogglePaymentMethod() {
  const client = useQueryClient();

  return useMutation({
    mutationKey: toggleKey,
    mutationFn: async ({ id, active }: PaymentMethodToggle) => {
      const { data } = await (active
        ? adminPaymentApi.activatePaymentMethod(id)
        : adminPaymentApi.deactivatePaymentMethod(id));

      if (data.success === false) {
        throw new Error(data.message || 'Could not update the payment method.');
      }
    },
    onSuccess: (_, { id, active }) => {
      client.setQueryData<AdminPaymentMethod[]>(paymentMethodsKey, (current) =>
        current?.map((method) => method.id === id ? { ...method, isActive: active } : method),
      );
    },
    onSettled: () => client.invalidateQueries({ queryKey: paymentMethodsKey }),
  });
}
