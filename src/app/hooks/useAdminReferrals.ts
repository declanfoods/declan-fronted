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
| STATUS: every admin referral screen is now live on a real endpoint
|--------------------------------------------------------------------------
| The two payout screens were the last holdouts. They ran on mock data behind
| a "Demo data — awaiting API" badge because the backend had no payout routes
| at all — the old code called /admin/referrals/payouts*, which never existed.
|
| The backend has since shipped the whole "Admin Referrals > Referral Payout"
| folder (list / detail / approve / reject), so those screens are live now and
| the demo badge is gone. See useAdminPayoutRequests and friends at the bottom
| of this file.
*/

export type { CommissionConfig, CashbackConfig, WalletConfig };

// ─── Admin Referrals → Referral Payout ──────────────────────────────────

/**
 * GET /admin/referrals/withdrawal-requests — the payout queue.
 *
 * Same defensive pattern as the other list hooks: the collection documents no
 * query params on any endpoint, so if the server rejects ours we retry once
 * params-free rather than showing an empty queue on a working backend.
 */
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
          // eslint-disable-next-line no-console
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

/** GET /admin/referrals/withdrawal-requests/:id — one request + approver context. */
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

/**
 * PATCH .../:id/approve — no request body.
 *
 * Invalidates the queue, this request, AND the admin users list: approving
 * moves money, so every wallet balance shown elsewhere in the admin is stale.
 */
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

/** PATCH .../:id/reject — `reason` is required and is what the customer sees. */
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