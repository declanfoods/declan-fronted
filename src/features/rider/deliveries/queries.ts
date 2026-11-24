import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../app/lib/query-client';
import { riderDeliveryApi } from './api';

const deliveriesKey = ['rider', 'deliveries'] as const;

export function refreshRiderDeliveries() {
  return queryClient.invalidateQueries({ queryKey: deliveriesKey });
}

export function useAssignedDeliveries(enabled = true) {
  return useQuery({
    queryKey: [...deliveriesKey, 'list'],
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await riderDeliveryApi.getAssignedDeliveries(signal);
      return data.data?.deliveries ?? [];
    },
  });
}

export function useAssignedDelivery(id: string | undefined) {
  return useQuery({
    queryKey: [...deliveriesKey, 'detail', id],
    enabled: !!id,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const { data } = await riderDeliveryApi.getAssignedDelivery(id, signal);
      return data.data?.delivery ?? null;
    },
  });
}

export async function advanceDelivery(id: string, status: 'ASSIGNED' | 'PICKED_UP') {
  if (status === 'ASSIGNED') await riderDeliveryApi.pickUpOrder(id);
  else await riderDeliveryApi.startDelivery(id);
  await refreshRiderDeliveries();
}
