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
  /*
    The customer's own name/avatar/addresses.

    ⚠️ This is the ONLY customer-facing endpoint that returns the user's real
    name. `referralCode` below returns "profile": null, so anything that needs
    to greet the signed-in user has to come here.
  */
  customerProfile: ['user', 'profile-overview'] as const,

  // ── Customer referral ──────────────────────────────────────────────
  referralCode: ['referral', 'code'] as const,
  referralWallet: ['referral', 'wallet'] as const,
  referralMetrics: ['referral', 'metrics'] as const,
  referralNetworks: (filters?: { page?: number; limit?: number }) =>
    ['referral', 'networks', filters ?? {}] as const,
  referralHistory: (filters?: { page?: number; limit?: number }) =>
    ['referral', 'history', filters ?? {}] as const,
  referralDownline: (id: string) => ['referral', 'downline', id] as const,
  /**
   * The ladder itself — how many levels, the rate at each, head-counts.
   * Separate from `referralTreeLevel` so tapping between levels doesn't
   * refetch the ladder.
   */
  referralTree: ['referral', 'tree'] as const,
  /** The people at one level. Keyed by level so each rung caches separately. */
  referralTreeLevel: (level: number, filters?: { page?: number; limit?: number }) =>
    ['referral', 'tree', level, filters ?? {}] as const,
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

  // ── Admin categories ───────────────────────────────────────────────
  // The whole ['admin','categories'] prefix is invalidated after a create so
  // both tabs refresh together.
  /** GET /api/v1/admin/dashboard/overview — the admin home screen. */
  adminDashboardOverview: ['admin', 'dashboard', 'overview'] as const,

  // ── Admin payments ─────────────────────────────────────────────────
  /** The payment methods admins can switch on and off. */
  adminPaymentMethods: ['admin', 'payments', 'payment-methods'] as const,

  // ── Admin stock history ────────────────────────────────────────────
  /** Every stock change, paginated. */
  adminStockHistory: (filters?: { page?: number; limit?: number }) =>
    ['admin', 'stocks', 'history', filters ?? {}] as const,
  /** One stock change record. */
  adminStockHistoryRecord: (recordId: string) =>
    ['admin', 'stocks', 'history', 'record', recordId] as const,
  /** Stock changes for one product, keyed by product so each caches apart. */
  adminStockProductHistory: (
    productId: string,
    filters?: { page?: number; limit?: number }
  ) => ['admin', 'stocks', 'product', productId, filters ?? {}] as const,

  /**
   * Admin order insights, keyed by period. Three separate cache entries so
   * flipping between Today / This week / This month is instant on revisit.
   */
  adminOrderMetrics: (period?: string) =>
    ['admin', 'orders', 'metrics', period ?? 'week'] as const,

  productCategories: ['admin', 'categories', 'products'] as const,
  foodPackCategories: ['admin', 'categories', 'food-packs'] as const,

  /*
    The rich admin category lists, from the dedicated endpoints. Separate from
    the two keys above, which are the plain { id, name } lists that feed the
    product/foodpack form dropdowns — different endpoints, different payloads,
    so they must not share a cache entry.
  */
  productCategoryOverview: ['admin', 'categories', 'products', 'overview'] as const,
  foodPackCategoryOverview: ['admin', 'categories', 'food-packs', 'overview'] as const,
  productCategoryMetrics: ['admin', 'categories', 'products', 'metrics'] as const,
  foodPackCategoryMetrics: ['admin', 'categories', 'food-packs', 'metrics'] as const,

  /*
    REMOVED: categoryProductIndex / categoryFoodPackIndex.

    Those two keys backed a workaround — fetching every product and every
    foodpack purely to count how many sat in each category, because the
    category payloads had no count field. The dedicated admin category
    endpoints now return `productCount` / `foodpackCount` directly, so the
    workaround, its keys, and the 1000-item truncation warning it needed are
    all gone. Nothing fetches a whole catalogue to produce a count any more.
  */
};
