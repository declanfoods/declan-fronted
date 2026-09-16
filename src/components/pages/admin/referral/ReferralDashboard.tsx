import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ShieldCheck,
  ClipboardList,
  Wallet,
  BarChart3,
  Gift,
  Banknote,
  GitBranch,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { useAdminReferrals } from '../../../../app/hooks/useAdminReferrals';
import { useAdminUserMetrics } from '../../../../app/hooks/useAdminUsers';

/*
|--------------------------------------------------------------------------
| Admin → Referral Dashboard — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: growth bars [30,45,40,60,55,90], "12,842" network, "4,200"
| qualified, "1,150" pending, "₦4.2M paid", "₦850k cashback", "+12%",
| "8 Payouts Pending", and an insight feed from mockReferralData.
|
| AFTER — what is real vs. what is NOT:
|
|   REAL (derived from /admin/referrals):
|     Total Referral Network   ← pagination.totalItems
|     Total Commissions         ← sum of `commissions` across the page
|     Commission per level      ← grouped by `level`
|     Members with a network    ← networkSize > 0
|
|   NOT AVAILABLE — needs a backend aggregate endpoint:
|     "Total Rewards Paid" and "Total Cashback" are lifetime money figures.
|     The referrals list endpoint only exposes per-member commission, so these
|     cards are labelled as page-scoped sums rather than fake lifetime totals.
|     Ask the backend for GET /admin/referrals/summary.
|
|   REMOVED: the 6-bar "Growth & Trends" chart. There is no time-series
|   endpoint behind it, and drawing bars from invented numbers is exactly the
|   problem this pass is fixing. The level breakdown replaces it.
*/

const PAGE_SIZE = 100; // dashboard aggregates from one large page

export default function ReferralDashboard() {
  const navigate = useNavigate();

  const referralsQuery = useAdminReferrals({ page: 1, limit: PAGE_SIZE });
  const userMetricsQuery = useAdminUserMetrics();

  const members = referralsQuery.data?.referrals ?? [];
  const pagination = referralsQuery.data?.pagination;

  const totalNetwork = pagination?.totalItems ?? members.length;
  const withNetwork = members.filter((m) => (m.networkSize ?? 0) > 0).length;

  // Sum of commissions across the loaded page.
  // (per-member totals, so a true lifetime figure needs a summary endpoint)
  const totalCommissions = members.reduce((sum, m) => sum + Number(m.commissions ?? 0), 0);

  // Commission grouped by referral level — replaces the fake bar chart.
  const byLevel = members.reduce<Record<number, { count: number; commissions: number }>>(
    (acc, m) => {
      const level = Number(m.level ?? 1);
      acc[level] = acc[level] ?? { count: 0, commissions: 0 };
      acc[level].count += 1;
      acc[level].commissions += Number(m.commissions ?? 0);
      return acc;
    },
    {}
  );

  const levels = Object.entries(byLevel)
    .map(([level, data]) => ({ level: Number(level), ...data }))
    .sort((a, b) => a.level - b.level);

  const maxLevelCommissions = Math.max(1, ...levels.map((l) => l.commissions));

  const suspendedUsers = (userMetricsQuery.data as { suspendedUsers?: number } | undefined)
    ?.suspendedUsers;

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button
          type="button"
          aria-label="Menu"
          onClick={() => navigate('/admin/more')}
          className="text-primary-dark"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral Dashboard</h1>
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => referralsQuery.refetch()}
          className="ml-auto text-primary-dark"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Referral Network</p>
            <span className="text-xs font-semibold text-primary">
              {pagination ? `page ${pagination.currentPage}/${pagination.totalPages}` : ''}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-primary">
            {referralsQuery.isLoading
              ? '—'
              : totalNetwork.toLocaleString()}
          </p>
        </div>

        {referralsQuery.isError && (
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Could not load referral data.</p>
            <button
              type="button"
              onClick={() => referralsQuery.refetch()}
              className="mt-3 text-sm font-semibold text-primary"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{withNetwork}</p>
              <p className="text-xs text-gray-400">With a network</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <ClipboardList size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">{members.length}</p>
              <p className="text-xs text-gray-400">Referrers listed</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
            FINANCIAL OVERVIEW
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary p-4 text-white">
              <p className="text-xs text-white/80">Commissions (loaded)</p>
              <p className="mt-1 text-xl font-extrabold">
                ₦{totalCommissions.toLocaleString()}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <Wallet size={11} />
                PER-MEMBER TOTALS
              </p>
            </div>
            <div className="rounded-2xl bg-rose-600 p-4 text-white">
              <p className="text-xs text-white/80">Suspended Users</p>
              <p className="mt-1 text-xl font-extrabold">
                {suspendedUsers ?? '—'}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <ClipboardList size={11} />
                FROM USER METRICS
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Lifetime "rewards paid" and "cashback" totals need a summary endpoint —
            there is no aggregate route for them yet.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-900">Commissions by Level</h2>
            <p className="text-xs text-gray-400">Replaces the mock growth chart</p>
          </div>

          {levels.length === 0 && (
            <p className="py-4 text-center text-xs text-gray-400">No data yet.</p>
          )}

          <div className="space-y-3">
            {levels.map((l) => (
              <div key={l.level}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Level {l.level}{' '}
                    <span className="text-xs text-gray-400">({l.count} members)</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    ₦{l.commissions.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(l.commissions / maxLevelCommissions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/settings')}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                <Gift size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800">Manage Rewards</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/settings/commission')}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                <Banknote size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800">Manage Cashback</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/settings/commission')}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                <GitBranch size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800">Manage Commissions</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/insights')}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                <BarChart3 size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800">View Insights</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Top Referrers</h2>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {members.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400">
                No referrers yet.
              </p>
            )}

            {[...members]
              .sort((a, b) => Number(b.commissions ?? 0) - Number(a.commissions ?? 0))
              .slice(0, 5)
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(`/admin/referrals/members/${m.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {m.fullname
                      ?.split(' ')
                      .filter(Boolean)
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {m.fullname}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.networkSize ?? 0} network • L{m.level}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    ₦{Number(m.commissions ?? 0).toLocaleString()}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
          </div>
        </section>
      </main>

      <ReferralBottomNav />
    </div>
  );
}
