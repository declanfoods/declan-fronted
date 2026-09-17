import { QueryClient } from '@tanstack/react-query';

/*
|--------------------------------------------------------------------------
| QueryClient
|--------------------------------------------------------------------------
| `react-query` was already a dependency but was never actually mounted —
| no QueryClientProvider existed anywhere, so nothing could use useQuery.
|
| Defaults chosen for this app:
| - staleTime 60s  → admin lists don't refetch on every tab switch.
| - retry: don't retry 4xx (auth / validation errors are not transient),
|   retry 5xx twice.
| - refetchOnWindowFocus off → this is a dashboard used on mobile; constant
|   refetching on focus burns the free Render backend's cold-start quota.
*/

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;

        // Never retry client errors — they will fail identically every time.
        if (status && status >= 400 && status < 500) return false;

        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/*
|--------------------------------------------------------------------------
| Central query keys
|--------------------------------------------------------------------------
| Keeping them in one object stops typo-driven cache misses and makes
| invalidation predictable.
*/

export const queryKeys = {
  // ── Customer referral ──────────────────────────────────────────────
  referralCode: ['referral', 'code'] as const,
  referralWallet: ['referral', 'wallet'] as const,
  referralMetrics: ['referral', 'metrics'] as const,
  referralNetworks: (filters?: { page?: number; limit?: number }) =>
    ['referral', 'networks', filters ?? {}] as const,
  referralHistory: (filters?: { page?: number; limit?: number }) =>
    ['referral', 'history', filters ?? {}] as const,
  referralDownline: (id: string) => ['referral', 'downline', id] as const,
  /** Customer's own payout requests — folder "Referrals > Withdrawal Request". */
  withdrawalRequests: ['referral', 'withdrawal-requests'] as const,

  // ── Admin users ────────────────────────────────────────────────────
  adminUsers: (filters?: Record<string, unknown>) => ['admin', 'users', filters ?? {}] as const,
  adminUserMetrics: ['admin', 'users', 'metrics'] as const,
  adminUser: (id: string) => ['admin', 'users', id] as const,
  adminUserOrders: (id: string) => ['admin', 'users', id, 'orders'] as const,
  adminUserActivities: (id: string, filters?: Record<string, unknown>) =>
    ['admin', 'users', id, 'activities', filters ?? {}] as const,
  adminUserTransactions: (id: string, filters?: Record<string, unknown>) =>
    ['admin', 'users', id, 'transactions', filters ?? {}] as const,
  adminUserWallet: (id: string) => ['admin', 'users', id, 'wallet'] as const,
  adminUserReferrals: (id: string) => ['admin', 'users', id, 'referrals'] as const,
  adminUserReferralTransactions: (id: string, filters?: Record<string, unknown>) =>
    ['admin', 'users', id, 'referral-transactions', filters ?? {}] as const,

  // ── Admin referral ─────────────────────────────────────────────────
  adminReferrals: (filters?: Record<string, unknown>) =>
    ['admin', 'referrals', filters ?? {}] as const,
  adminUserReferralMetrics: (userId: string, filters?: Record<string, unknown>) =>
    ['admin', 'referrals', 'users', userId, 'metrics', filters ?? {}] as const,

  // ── Admin referral payouts (folder: Admin Referrals > Referral Payout) ──
  // The prefix ['admin','referrals','payouts'] is intentional: the approve and
  // reject mutations invalidate that whole prefix to refresh the queue.
  adminPayoutRequests: (filters?: Record<string, unknown>) =>
    ['admin', 'referrals', 'payouts', filters ?? {}] as const,
  adminPayoutRequest: (id: string) => ['admin', 'referrals', 'payouts', id] as const,

  // ── Admin config ───────────────────────────────────────────────────
  adminCommissionConfig: ['admin', 'config', 'commission'] as const,
  adminReferralConfig: ['admin', 'config', 'referral'] as const,
  adminWithdrawalConfig: ['admin', 'config', 'withdrawal'] as const,
};