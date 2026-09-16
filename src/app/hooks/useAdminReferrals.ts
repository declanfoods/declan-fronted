import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { adminReferralApi } from '../lib/adminReferralApi';
import type {
  AdminReferralFilters,
  AdminReferralListItem,
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

/*
|--------------------------------------------------------------------------
| Admin referral hooks
|--------------------------------------------------------------------------
| Replaces mockReferralData.ts for every screen that has a real endpoint.
| Screens with NO backend endpoint yet are flagged inline (see the bottom).
*/

// ─── Referral list ──────────────────────────────────────────────────────

export function useAdminReferrals(filters?: AdminReferralFilters) {
  return useQuery<{ referrals: AdminReferralListItem[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.adminReferrals(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getReferrals(filters);
        return res.data.data;
      } catch (error) {
        /*
          Same defensive retry as useAdminUsers: the collection documents NO
          query parameters on any endpoint, so if this backend validates
          strictly it may reject `page`/`limit`/`search`/`level` outright.
          Retry once without params so the list still renders.
        */
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.level)
        );

        if (sentParams && (status === 400 || status === 422)) {

          // eslint-disable-next-line no-console
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

/** One user's referral summary header (NOT a list — see adminReferralApi). */
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

/** The paginated list of a user's direct referrals (admin drill-down). */
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
        /*
          The collection documents NO query parameters on any endpoint. If this
          backend rejects `page`/`limit`, the member's whole network list fails
          to load — which is exactly what "view member network no dey work"
          looked like. Retry once params-free so the list still renders.
        */
        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(filters && (filters.page || filters.limit));

        if (status === 400 || status === 422) {
          if (sentParams) {
            // eslint-disable-next-line no-console
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

// ─── Config: referral program ───────────────────────────────────────────

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

/*
|--------------------------------------------------------------------------
| ⛔ BACKEND GAP — payout / withdrawal requests
|--------------------------------------------------------------------------
| PayoutQueue.tsx and PayoutRequestDetails.tsx are fully built in the UI, but
| there is NO endpoint in referralApi.ts or adminReferralApi.ts for:
|
|   GET   /admin/referrals/payouts            (list requests)
|   GET   /admin/referrals/payouts/:id        (single request)
|   PATCH /admin/referrals/payouts/:id/approve
|   PATCH /admin/referrals/payouts/:id/reject
|   PATCH /admin/referrals/payouts/:id/status
|
| Also missing on the customer side:
|   POST  /referrals/withdraw                (used by app/referral/Withdraw.tsx)
|
| Two options — pick one and I'll finish it:
|   (a) Get those 5 endpoints added to the backend, then swap these screens
|       over exactly like the others.
|   (b) Keep them mock-only behind a feature flag until the API lands.
|
| Both screens currently render their mock data but are clearly badged in the
| UI as "Demo data — awaiting API". They are NOT silently faking it.
*/

export type { CommissionConfig, CashbackConfig, WalletConfig };