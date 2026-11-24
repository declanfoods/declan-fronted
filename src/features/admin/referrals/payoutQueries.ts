import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiPagination } from '../../../app/lib/api-types';
import { adminUserKeys } from '../users/queryKeys';
import {
  adminReferralApi,
  type AdminPayoutRequest,
  type AdminPayoutRequestDetail,
  type PayoutRequestFilters,
} from './api';
import { adminReferralKeys } from './queryKeys';

export function useAdminPayoutRequests(filters?: PayoutRequestFilters) {
  return useQuery<
    { payoutRequests: AdminPayoutRequest[]; pagination: ApiPagination },
    Error
  >({
    queryKey: adminReferralKeys.payoutList(filters),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getPayoutRequests(filters);
        return res.data.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.status)
        );

        if (sentParams && (status === 400 || status === 422)) {
          console.warn(
            '[admin] GET /admin/referrals/withdrawal-requests rejected our query params (HTTP ' +
              status +
              '). Retrying without them.'
          );

          const fallback = await adminReferralApi.getPayoutRequests();
          return fallback.data.data;
        }

        throw error;
      }
    },
    placeholderData: (previous) => previous,
  });
}

export function useAdminPayoutRequest(id?: string) {
  return useQuery<AdminPayoutRequestDetail, Error>({
    queryKey: adminReferralKeys.payout(id ?? ''),
    queryFn: async () => {
      const res = await adminReferralApi.getPayoutRequestById(id as string);
      return res.data.data.payoutRequest;
    },
    enabled: Boolean(id),
  });
}

export function usePendingPayouts() {
  return useQuery({
    queryKey: adminReferralKeys.pendingPayout,
    queryFn: async () => {
      const { data } = await adminReferralApi.getPayoutRequests({
        status: 'PENDING',
        page: 1,
        limit: 1,
      });
      return data.data;
    },
    retry: false,
  });
}

function useInvalidatePayouts() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: adminReferralKeys.payouts }),
    client.invalidateQueries({ queryKey: adminUserKeys.all }),
  ]);
}

export function useApprovePayout() {
  return useMutation({
    mutationFn: adminReferralApi.approvePayout,
    onSuccess: useInvalidatePayouts(),
  });
}

export function useRejectPayout() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminReferralApi.rejectPayout(id, reason),
    onSuccess: useInvalidatePayouts(),
  });
}
