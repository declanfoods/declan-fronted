import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { referralApi } from '../lib/referralApi';
import type {
  DirectReferral,
  ReferralCodeData,
  ReferralFilters,
  ReferralHistoryItem,
  ReferralMetrics,
  ReferralWallet,
  WithdrawalRequestPayload,
} from '../lib/referralApi';
import type { ApiPagination } from '../lib/api-types';
import { queryKeys } from '../lib/query-client';

/*
|--------------------------------------------------------------------------
| Customer referral hooks
|--------------------------------------------------------------------------
| All read-only referral data for the /app/referrals/* screens lives here.
| Screens stay presentational; they read `data` / `isLoading` / `error`.
*/

/**
 * A safe first name for the greeting.
 *
 * ⚠️ Confirmed against the Postman docs: `GET /referrals/code` returns
 * `"profile": null` for most accounts (profile is optional in this backend).
 * Falling straight through to a hardcoded 'there' makes every user look
 * anonymous, so we degrade gracefully:
 *
 *   profile.firstName  →  email local-part, title-cased  →  'there'
 *
 * e.g. "amadijustice1@yopmail.com" becomes "Amadijustice1".
 */
export function deriveFirstName(code?: ReferralCodeData): string {
  const first = code?.user?.profile?.firstName?.trim();
  if (first) return first;

  const local = code?.user?.email?.split('@')[0]?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);

  return 'there';
}

export function useReferralCode(): UseQueryResult<ReferralCodeData, Error> {
  return useQuery({
    queryKey: queryKeys.referralCode,
    queryFn: async () => {
      const res = await referralApi.getCode();
      return res.data.data;
    },
    // A referral code never changes for a user — cache it hard.
    staleTime: 30 * 60_000,
  });
}

export function useReferralWallet(): UseQueryResult<ReferralWallet, Error> {
  return useQuery({
    queryKey: queryKeys.referralWallet,
    queryFn: async () => {
      const res = await referralApi.getWallet();
      return res.data.data.referralWallet;
    },
  });
}

export function useReferralMetrics(): UseQueryResult<ReferralMetrics, Error> {
  return useQuery({
    queryKey: queryKeys.referralMetrics,
    queryFn: async () => {
      const res = await referralApi.getMetrics();
      return res.data.data.metrics;
    },
  });
}

export function useReferralNetworks(filters?: ReferralFilters) {
  return useQuery<{ referrals: DirectReferral[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.referralNetworks(filters),
    queryFn: async () => {
      const res = await referralApi.getNetworks(filters);
      return res.data.data;
    },
    placeholderData: (previous) => previous,
  });
}

export function useReferralHistory(filters?: ReferralFilters) {
  return useQuery<{ history: ReferralHistoryItem[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.referralHistory(filters),
    queryFn: async () => {
      const res = await referralApi.getHistory(filters);
      return res.data.data;
    },
    placeholderData: (previous) => previous,
  });
}

/**
 * POST /api/v1/referrals/withdraw
 *
 * ⚠️ The backend route does not exist yet, so this rejects with a 404 until it
 * ships. The Withdraw screen checks for that status and shows a "not live yet"
 * message rather than a success screen.
 *
 * On success we invalidate the wallet + history so the balance and ledger
 * refresh from the server instead of being optimistically guessed.
 */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WithdrawalRequestPayload) =>
      referralApi.requestWithdrawal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referralWallet });
      queryClient.invalidateQueries({ queryKey: ['referral', 'history'] });
    },
  });
}
