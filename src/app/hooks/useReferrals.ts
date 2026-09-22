import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { referralApi } from '../lib/referralApi';
import { userApi } from '../lib/userApi';
import type {
  DirectReferral,
  ReferralTree,
  ReferralTreeLevelData,
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

/*
|--------------------------------------------------------------------------
| deriveDisplayName — the user's own name, for the referral header
|--------------------------------------------------------------------------
| ⚠️ WHY THIS EXISTS, AND WHAT IT FIXES
|
| The referral shell's mobile header used to render:
|
|     <p>{firstName} Doe</p>
|
| " Doe" was a STRING LITERAL in the JSX, and `firstName` defaulted to the
| literal 'John'. So Withdraw and Rewards Guide — which render the layout with
| no props at all — greeted EVERY user as "John Doe", whoever was signed in.
| The other four referral screens passed a first name and so read "Justice
| Doe", "Lilian Doe": a real first name with an invented surname glued on.
|
| Nobody is called Doe. It was placeholder text that never got removed.
|
| ⚠️ WHY IT NOW TAKES TWO SOURCES
|
| Removing the placeholder was only half of it. The remaining problem is that
| the endpoint this header naturally reaches for does not carry a name:
|
|   GET /api/v1/referrals/code
|     → "profile": null            ← no name, for real accounts
|
|   GET /api/v1/users/profile-overview
|     → { "fullname": "...", "profile": { "firstName", "lastName" } }
|
| The referral payload's `profile` is null in the collection's own saved
| sample, so the header had nothing to show and fell through to the email
| prefix — which is why it read "Amadijustice1" rather than a person's name.
|
| `profile-overview` is the endpoint the Profile screen and the dashboard
| already use to display the customer's name, so it is the authoritative
| source. It is checked FIRST; the referral payload is only a fallback for
| the case where it fails.
|
| Fallback order, best first:
|
|   1. profile.firstName + profile.lastName   → "Justice Amadi"   (best)
|   2. profile.firstName                     → "Justice"
|   3. profile.lastName only                 → "Amadi"
|   4. fullname, as the API sends it          → "Justice Amadi"
|   5. the same three fields off /referrals/code
|   6. the email local part, capitalised      → "Amadijustice1"
|   7. ''  — nothing known, so the caller renders a placeholder rather than
|      inventing a name
|
| ⚠️ Returns '' rather than a word like 'there' when nothing is known, so the
|    caller can tell "no name yet" apart from "name is literally 'there'" and
|    show a loading placeholder instead of a fake name.
*/

/** The name-bearing part of GET /api/v1/users/profile-overview. */
export interface ProfileNameSource {
  fullname?: string | null;
  email?: string | null;
  profile?: { firstName?: string | null; lastName?: string | null } | null;
}

export interface DisplayNameSources {
  /** GET /api/v1/users/profile-overview — the one that has a real name. */
  profileOverview?: ProfileNameSource | null;
  /** GET /api/v1/referrals/code — fallback; `profile` is usually null here. */
  referralCode?: ReferralCodeData | null;
}

function nameFromProfile(profile?: ProfileNameSource | null): string {
  const first = profile?.profile?.firstName?.trim();
  const last = profile?.profile?.lastName?.trim();

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  if (profile?.fullname?.trim()) return profile.fullname.trim();

  return '';
}

function nameFromReferralCode(code?: ReferralCodeData | null): string {
  const first = code?.user?.profile?.firstName?.trim();
  const last = code?.user?.profile?.lastName?.trim();

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;

  return '';
}

export function deriveDisplayName(sources?: DisplayNameSources | null): string {
  const fromProfile = nameFromProfile(sources?.profileOverview);
  if (fromProfile) return fromProfile;

  const fromCode = nameFromReferralCode(sources?.referralCode);
  if (fromCode) return fromCode;

  const local = (
    sources?.profileOverview?.email ?? sources?.referralCode?.user?.email
  )
    ?.split('@')[0]
    ?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);

  return '';
}

/*
  The signed-in customer's name source, cached under its own key so the
  Profile screen and the dashboard can share it.
*/
export function useCustomerProfile(): UseQueryResult<ProfileNameSource, Error> {
  return useQuery({
    queryKey: queryKeys.customerProfile,
    queryFn: async () => {
      const res = await userApi.getProfileOverview();
      return res.data.data.user;
    },
    // A name does not change mid-session.
    staleTime: 30 * 60_000,
  });
}

/*
  The first name alone, for the desktop greeting and the avatar initial.

  Same two sources and the same order as `deriveDisplayName` — see the note
  above. Kept separate because callers want a single word here, and because
  this one returns 'there' rather than '' when nothing is known: the avatar
  needs an initial, and a bare "Welcome Back!" reads worse than "Welcome
  Back, there!".
*/
export function deriveFirstName(sources?: DisplayNameSources | null): string {
  const full = nameFromProfile(sources?.profileOverview) || nameFromReferralCode(sources?.referralCode);
  if (full) return full.split(' ')[0];

  const local = (
    sources?.profileOverview?.email ?? sources?.referralCode?.user?.email
  )
    ?.split('@')[0]
    ?.trim();
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

/*
|==========================================================================
| Referral tree
|==========================================================================
| Powers the interactive Network screen. Two hooks:
|
|   useReferralTree()            → the ladder: every level, its rate, head-count
|   useReferralsAtLevel(level)   → the people at one rung
|
| The screen loads level 1 by default and swaps `level` when a chip is tapped.
| TanStack caches each level separately, so tapping back and forth is instant
| after the first visit.
*/

/** GET /api/v1/referrals/tree — the ladder itself. */
export function useReferralTree(): UseQueryResult<ReferralTree, Error> {
  return useQuery<ReferralTree, Error>({
    queryKey: queryKeys.referralTree,
    queryFn: async () => {
      const res = await referralApi.getTree();
      return res.data.data;
    },
  });
}

/**
 * GET /api/v1/referrals/tree/:treeLevel — the people at one level.
 *
 * `enabled: level >= 1` guards against a level of 0 or NaN reaching the URL,
 * which would hit `/referrals/tree/0` and 404.
 */
export function useReferralsAtLevel(
  level: number,
  filters?: ReferralFilters
): UseQueryResult<ReferralTreeLevelData, Error> {
  return useQuery<ReferralTreeLevelData, Error>({
    queryKey: queryKeys.referralTreeLevel(level, filters),
    queryFn: async () => {
      const res = await referralApi.getTreeLevel(level, filters);
      return res.data.data;
    },
    enabled: Number.isFinite(level) && level >= 1,
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
