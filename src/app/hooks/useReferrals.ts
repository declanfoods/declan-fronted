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
  InitiateWithdrawalPayload,
  PayoutRequest,
  WithdrawalRequestsPage,
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
export function useInitiateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof referralApi.initiateWithdrawal>>,
    Error,
    InitiateWithdrawalPayload
  >({
    mutationFn: (payload: InitiateWithdrawalPayload) =>
      referralApi.initiateWithdrawal(payload),
    onSuccess: () => {
      /*
        Balance is NOT optimistically decremented. The backend decides whether
        the funds are reserved at initiate or at verify, and the docs don't say
        which. Refetching is always correct; guessing could show a customer a
        balance that doesn't match their wallet.
      */
      queryClient.invalidateQueries({ queryKey: queryKeys.referralWallet });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalRequests });
      queryClient.invalidateQueries({ queryKey: ['referral', 'history'] });
    },
  });
}

/**
 * Step 2 — PATCH /referrals/withdrawals/requests/:id/verify
 *
 * Sends the code that initiate emailed. On success `verificationStatus`
 * becomes VERIFIED while `requestStatus` stays PENDING: the request is now
 * sitting in the admin payout queue.
 */
export function useVerifyWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof referralApi.verifyWithdrawal>>,
    Error,
    { id: string; verificationCode: string }
  >({
    mutationFn: ({ id, verificationCode }) =>
      referralApi.verifyWithdrawal(id, verificationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalRequests });
    },
  });
}

/**
 * Re-sends the verification email for an existing request.
 *
 * Separate from initiate on purpose: this must NOT create a second payout
 * request. Use it on the "code never arrived" path.
 */
export function useResendWithdrawalCode() {
  return useMutation({
    mutationFn: (id: string) => referralApi.requestWithdrawalVerification(id),
  });
}

/** Customer cancels their own request. Only valid while PENDING. */
export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => referralApi.cancelWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.referralWallet });
    },
  });
}

/** The customer's own payout request history, newest first. */
export function useWithdrawalRequests(
  filters?: ReferralFilters
): UseQueryResult<WithdrawalRequestsPage, Error> {
  return useQuery<WithdrawalRequestsPage, Error>({
    queryKey: [...queryKeys.withdrawalRequests, filters ?? {}],
    queryFn: async () => {
      const res = await referralApi.getWithdrawalRequests(filters);
      return res.data.data;
    },
  });
}

/** Convenience: the most recent request still awaiting verification. */
export function usePendingVerificationRequest(): PayoutRequest | null {
  const query = useWithdrawalRequests();

  const pending =
    query.data?.payoutRequests?.find(
      (r) => r.verificationStatus === 'UNVERIFIED' && r.requestStatus === 'PENDING'
    ) ?? null;

  return pending;
}