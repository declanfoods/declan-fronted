import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { adminReferralApi } from '../lib/adminReferralApi';
import type {
  AdminPayoutRequest,
  AdminPayoutRequestDetail,
  AdminReferralFilters,
  AdminReferralListItem,
  PayoutRequestFilters,
  AdminUserReferralSummary,
  CommissionConfig,
  CashbackConfig,
  FullCommissionConfigResponse,
  ReferralProgramConfig,
  UpdateCashbackPayload,
  UpdateCommissionPayload,
  UpdateReferralProgramPayload,
  UpdateWalletPayload,
  UpdateWithdrawalPayload,
  UserReferralMetricItem,
  WalletConfig,
  WithdrawalConfig,
} from '../lib/adminReferralApi';
import type { ApiPagination } from '../lib/api-types';
import { queryKeys } from '../lib/query-client';



export function useAdminReferrals(filters?: AdminReferralFilters) {
  return useQuery<{ referrals: AdminReferralListItem[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.adminReferrals(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getReferrals(filters);
        return res.data.data;
      } catch (error) {
       
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.level)
        );

        if (sentParams && (status === 400 || status === 422)) {

          console.warn(
            '[admin] GET /admin/referrals rejected our query params (HTTP ' +
              status +
              '). Retrying without them.'
          );

          const fallback = await adminReferralApi.getReferrals();
          return fallback.data.data;
        }

        throw error;
      }
    },
    placeholderData: (previous) => previous,
  });
}

export function useUserReferralMetrics(userId?: string) {
  return useQuery<AdminUserReferralSummary, Error>({
    queryKey: queryKeys.adminUserReferralMetrics(userId ?? ''),
    queryFn: async () => {
      const res = await adminReferralApi.getUserReferralMetrics(userId as string);
      return res.data.data.referral;
    },
    enabled: Boolean(userId),
  });
}

export function useUserDirectReferrals(
  userId?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<
    { referrals: UserReferralMetricItem[]; pagination: ApiPagination },
    Error
  >({
    queryKey: [...queryKeys.adminUserReferralMetrics(userId ?? ''), 'direct', filters ?? {}],
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getUserDirectReferrals(userId as string, filters);
        return res.data.data;
      } catch (error) {
        
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(filters && (filters.page || filters.limit));

        if (status === 400 || status === 422) {
          if (sentParams) {
            console.warn(
              '[admin] direct-referrals rejected our query params (HTTP ' +
                status +
                '). Retrying without them — report this to the backend team.'
            );
          }

          const fallback = await adminReferralApi.getUserDirectReferrals(userId as string);
          return fallback.data.data;
        }

        throw error;
      }
    },
    enabled: Boolean(userId),
    placeholderData: (previous) => previous,
  });
}

// ─── Config: commission + cashback + wallet ─────────────────────────────

export function useCommissionConfig(): UseQueryResult<FullCommissionConfigResponse, Error> {
  return useQuery({
    queryKey: queryKeys.adminCommissionConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getCommissionConfig();
      return res.data.data;
    },
  });
}

export function useUpdateCommissionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommissionPayload) =>
      adminReferralApi.updateCommissionConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCommissionConfig }),
  });
}

export function useUpdateCashbackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCashbackPayload) =>
      adminReferralApi.updateCashbackConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCommissionConfig }),
  });
}

export function useUpdateWalletConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWalletPayload) =>
      adminReferralApi.updateWalletConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCommissionConfig }),
  });
}


export function useReferralConfig(): UseQueryResult<ReferralProgramConfig, Error> {
  return useQuery({
    queryKey: queryKeys.adminReferralConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getReferralConfig();
      return res.data.data;
    },
  });
}

export function useUpdateReferralConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReferralProgramPayload) =>
      adminReferralApi.updateReferralConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferralConfig }),
  });
}

// ─── Config: withdrawals ────────────────────────────────────────────────

export function useWithdrawalConfig(): UseQueryResult<WithdrawalConfig, Error> {
  return useQuery({
    queryKey: queryKeys.adminWithdrawalConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getWithdrawalConfig();
      return res.data.data;
    },
  });
}

export function useUpdateWithdrawalConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWithdrawalPayload) =>
      adminReferralApi.updateWithdrawalConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminWithdrawalConfig }),
  });
}



export type { CommissionConfig, CashbackConfig, WalletConfig };


export function useAdminPayoutRequests(filters?: PayoutRequestFilters) {
  return useQuery<
    { payoutRequests: AdminPayoutRequest[]; pagination: ApiPagination },
    Error
  >({
    queryKey: queryKeys.adminPayoutRequests(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getPayoutRequests(filters);
        return res.data.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.requestStatus)
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
    queryKey: queryKeys.adminPayoutRequest(id ?? ''),
    queryFn: async () => {
      const res = await adminReferralApi.getPayoutRequestById(id as string);
      return res.data.data.payoutRequest;
    },
    enabled: Boolean(id),
  });
}


export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminReferralApi.approvePayout(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals', 'payouts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPayoutRequest(id) });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useRejectPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminReferralApi.rejectPayout(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals', 'payouts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPayoutRequest(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}