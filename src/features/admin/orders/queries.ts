import { useMutation, useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { queryClient } from '../../../app/lib/query-client';
import { adminOrderApi, type AdminOrderStatus, type OrderMetricsPeriod } from './api';

const ordersKey = ['admin', 'orders'] as const;

export const adminOrderMetricsKey = (period: OrderMetricsPeriod) =>
  [...ordersKey, 'metrics', period] as const;

export function refreshAdminOrders() {
  return queryClient.invalidateQueries({ queryKey: ordersKey });
}

export function useAdminOrders(status?: AdminOrderStatus) {
  return useQuery({
    queryKey: [...ordersKey, 'list', status],
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await adminOrderApi.getOrders({ status }, signal);
      return data.data.orders ?? [];
    },
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: [...ordersKey, 'detail', id],
    enabled: !!id,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const { data } = await adminOrderApi.getOrderById(id, signal);
      return data.data.order ?? null;
    },
  });
}

export function usePendingOrdersCount() {
  const pending = useQuery({
    queryKey: [...ordersKey, 'pending-count'],
    refetchInterval: 60_000,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await adminOrderApi.getPendingOrders(signal);
      return data.data.pendingOrders ?? 0;
    },
  });

  return pending.data ?? 0;
}

export function useMarkOrderProcessing(id: string | undefined, notify: (message: string, type: 'success' | 'error') => void) {
  return useMutation({
    mutationFn: ({ note, estimatedDeliveryTime }: { note: string; estimatedDeliveryTime: string }) => {
      if (!id) throw new Error('Order not found.');
      return adminOrderApi.markAsProcessing(id, {
        note,
        estimatedDeliveryTime: new Date(estimatedDeliveryTime).toISOString(),
      });
    },
    onSuccess: async () => {
      await refreshAdminOrders();
      notify('Order marked processing', 'success');
    },
    onError: (error) => notify(getApiErrorMessage(error, 'Failed to mark order as processing.'), 'error'),
  });
}
