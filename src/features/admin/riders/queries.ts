import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../app/lib/query-client';
import { adminRiderApi, type CreateDeliveryRiderPayload } from './api';

const adminRidersKey = ['admin', 'delivery-riders'] as const;

export function refreshAdminRiders() {
  return queryClient.invalidateQueries({ queryKey: adminRidersKey });
}

export function useAdminRiders(enabled = true) {
  return useQuery({
    queryKey: adminRidersKey,
    enabled,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await adminRiderApi.getDeliveryRiders(signal);
      if (data.success === false) throw new Error(data.message || 'Failed to load riders.');

      const payload = data.data;
      return Array.isArray(payload) ? payload : payload?.riders ?? [];
    },
  });
}

export function useCreateRider() {
  return useMutation({
    mutationFn: async (payload: CreateDeliveryRiderPayload) => {
      const { data } = await adminRiderApi.createDeliveryRider(payload);
      if (data.success === false) throw new Error(data.message || 'Failed to onboard rider.');
    },
    onSuccess: refreshAdminRiders,
  });
}

export function useUpdateRiderSuspension() {
  return useMutation({
    mutationFn: async ({ id, suspended }: { id: string; suspended: boolean }) => {
      const { data } = await (suspended
        ? adminRiderApi.suspendRider(id)
        : adminRiderApi.removeSuspension(id));
      if (data.success === false) throw new Error(data.message || 'Failed to update rider status.');
    },
    onSuccess: refreshAdminRiders,
  });
}
