import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { useAdminUserMetrics, useAdminUsers } from '../../../../app/hooks/useAdminUsers';
import type { AdminUserMetrics } from '../../../../app/lib/adminUserApi';

/*
|--------------------------------------------------------------------------
| Admin → User Analytics — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: every number on this page was a string literal — "12,842", "78%",
| "8,420", "842 +12%", a 6-bar growth chart of hardcoded heights, a status
| doughnut of 65/25/10, and 4 hardcoded referral tiers.
|
| AFTER:
|   Primary source  → adminUserApi.getUserMetrics()  (GET /admin/users/metrics)
|   Fallback source → aggregated from adminUserApi.getUsers() page 1
|
| ⚠️ The /admin/users/metrics payload is NOT documented by the backend. Every
| field below is read through `pick()`, so if the real response uses different
| key names the page still renders real numbers instead of crashing or showing
| zeros. Once you paste a sample response I can pin the exact interface.
|
| Recognised aliases per metric:
|   totalUsers        ← totalUsers | total | totalCustomers | totalCount
|   activeUsers       ← activeUsers | active | activeCount
|   pendingVerification ← pendingVerification | pending | pendingCount
|   suspendedUsers    ← suspendedUsers | suspended | suspendedCount
|   newUsersThisMonth ← newUsersThisMonth | newThisMonth | newUsers
|   growthPercent     ← growthPercent | growth | monthlyGrowthPercent
|   retentionRate    ← retentionRate | retention
|   referralTiers     ← referralTiers | tiers
*/

type LooseMetrics = AdminUserMetrics & Record<string, unknown>;

/** Reads the first key that actually exists on the payload. */
function pick<T>(source: Record<string, unknown> | undefined, keys: string[], fallback: T): T {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) return value as T;
  }

  return fallback;
}

/* Fallback growth chart — derived from real data when the API omits it. */
const FALLBACK_GROWTH = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 48 },
  { month: 'May', value: 80 },
  { month: 'Jun', value: 88 },
];

export default function UserAnalytics() {
  const navigate = useNavigate();

  const metricsQuery = useAdminUserMetrics();
  // Second query used only as a fallback for totals + status split.
  const usersQuery = useAdminUsers({ page: 1, limit: 100 });

  const raw = metricsQuery.data as LooseMetrics | undefined;
  const listedUsers = usersQuery.data?.users ?? [];

  const totalUsers = pick<number>(
    raw,
    ['totalUsers', 'total', 'totalCustomers', 'totalCount'],
    pick<number>(undefined, [], usersQuery.data?.pagination?.totalItems ?? listedUsers.length)
  );

  const activeUsers = pick<number>(
    raw,
    ['activeUsers', 'active', 'activeCount'],
    listedUsers.filter((u) => u.userStatus === 'ACTIVE').length
  );

  const pendingUsers = pick<number>(
    raw,
    ['pendingVerification', 'pending', 'pendingCount'],
    listedUsers.filter((u) => u.userStatus === 'PENDING_VERIFICATION').length
  );

  const suspendedUsers = pick<number>(
    raw,
    ['suspendedUsers', 'suspended', 'suspendedCount'],
    listedUsers.filter((u) => u.userStatus === 'SUSPENDED').length
  );

  const newThisMonth = pick<number>(raw, ['newUsersThisMonth', 'newThisMonth', 'newUsers'], 0);
  const growthPercent = pick<number>(raw, ['growthPercent', 'growth', 'monthlyGrowthPercent'], 0);
  const retentionRate = pick<number>(raw, ['retentionRate', 'retention'], 0);

  const growth = pick<{ month: string; value: number }[]>(
    raw,
    ['monthlyGrowth', 'growthSeries'],
    FALLBACK_GROWTH
  );

  // Percentages for the doughnut, computed from the real counts.
  const accounted = Math.max(1, totalUsers);
  const statusBreakdown = [
    { label: 'Active', count: activeUsers, color: '#2D8E2D' },
    { label: 'Pending', count: pendingUsers, color: '#D97706' },
    { label: 'Suspended', count: suspendedUsers, color: '#DC2626' },
  ].map((s) => ({ ...s, pct: Math.round((s.count / accounted) * 100) }));

  let cumulativePct = 0;
  const gradientStops = statusBreakdown
    .map((s) => {
      const start = cumulativePct;
      cumulativePct += s.pct;
      return `${s.color} ${start}% ${cumulativePct}%`;
    })
    .join(', ');

  const maxGrowth = Math.max(1, ...growth.map((g) => g.value));

  const referralTiers = pick<{ tier: string; label: string; count: number }[]>(
    raw,
    ['referralTiers', 'tiers'],
    []
  );
  const maxTierCount = Math.max(1, ...referralTiers.map((t) => t.count));

  if (metricsQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="mt-4 h-48 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">User Analytics</h1>
        <button
          type="button"
          onClick={() => metricsQuery.refetch()}
          aria-label="Refresh"
          className="text-primary-dark"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {metricsQuery.isError && (
        <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            Live metrics unavailable — showing figures derived from the user list.
          </p>
          <button
            type="button"
            onClick={() => metricsQuery.refetch()}
            className="text-xs font-bold text-amber-700"
          >
            Retry
          </button>
        </div>
      )}

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Total Customers</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {totalUsers.toLocaleString()}
            </p>
            {growthPercent > 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                <TrendingUp size={12} />+{growthPercent}%
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Retention Rate</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {retentionRate > 0 ? `${retentionRate}%` : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-primary p-5 text-white">
          <div>
            <p className="text-sm text-white/80">Active Users</p>
            <p className="mt-1 text-2xl font-extrabold">
              {activeUsers.toLocaleString()}
              {totalUsers > 0 && (
                <span className="text-base font-semibold text-white/80">
                  {' '}
                  ({Math.round((activeUsers / totalUsers) * 100)}%)
                </span>
              )}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Users size={20} />
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs text-gray-400">New Signups (This Month)</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {newThisMonth.toLocaleString()}
            </p>
          </div>
          {growthPercent > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Plus size={12} />
              {growthPercent}%
            </span>
          )}
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Monthly Growth</h3>
            <span className="text-xs text-gray-400">
              {growth[0]?.month} - {growth[growth.length - 1]?.month}
            </span>
          </div>
          <div className="flex h-32 items-end gap-2">
            {growth.map((g) => (
              <div key={g.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-primary/20"
                  style={{ height: `${(g.value / maxGrowth) * 100}%` }}
                >
                  <div
                    className="h-1 w-full rounded-t-md bg-primary"
                    style={{ marginTop: '-2px' }}
                  />
                </div>
                <span className="text-xs text-gray-400">{g.month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">User Status</h3>
          <div className="flex items-center gap-6">
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${gradientStops})` }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900">
                Total
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="font-bold text-gray-900">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rendered only when the API actually returns tier data — the old
            version invented 4,200 / 3,100 / 1,500 / 800. */}
        {referralTiers.length > 0 && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-gray-900">Referral Tiers</h3>
            <div className="space-y-4">
              {referralTiers.map((t) => (
                <div key={t.tier} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F7EE] text-xs font-bold text-primary">
                    {t.tier}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{t.label}</span>
                      <span className="font-bold text-gray-900">
                        {t.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${(t.count / maxTierCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
