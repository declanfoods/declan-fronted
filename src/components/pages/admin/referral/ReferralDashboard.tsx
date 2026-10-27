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
  Users,
  ArrowDownToLine,
} from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { useAdminReferrals, useAdminReferralMetrics } from '../../../../app/hooks/useAdminReferrals';

const PAGE_SIZE = 5;

export default function ReferralDashboard() {
  const navigate = useNavigate();

  const referralsQuery = useAdminReferrals({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: 'networkSize',
    sortOrder: 'DESC',
  });
  const metricsQuery = useAdminReferralMetrics();

  const members = referralsQuery.data?.referrals ?? [];
  const metrics = metricsQuery.data?.metrics;

  // Commissions by level — for the bar chart section
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

  const isLoading = referralsQuery.isLoading || metricsQuery.isLoading;

  const handleRefresh = () => {
    referralsQuery.refetch();
    metricsQuery.refetch();
  };

  // Retention rate: payout vs earned — gives a sense of how much has been
  // actually disbursed relative to what was earned
  const payoutRate =
    metrics?.totalAmountEarned && metrics.totalAmountEarned > 0
      ? Math.round((metrics.totalPayout / metrics.totalAmountEarned) * 100)
      : null;

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
          onClick={handleRefresh}
          className="ml-auto text-primary-dark"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">

        {(referralsQuery.isError || metricsQuery.isError) && (
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Could not load referral data.</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 text-sm font-semibold text-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Top-line metrics ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-2xl bg-primary p-4 text-white">
            <p className="text-xs text-white/70">Total Referral Network</p>
            <p className="mt-1 text-3xl font-extrabold">
              {isLoading ? '—' : (metrics?.totalReferralNetwork ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
              <Users size={11} />
              All-time registered referrals
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">
                {isLoading ? '—' : (metrics?.numberOfPeopleWithNetwork ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">With a network</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <ClipboardList size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">
                {isLoading ? '—' : (metrics?.listedReferrers ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Listed referrers</p>
            </div>
          </div>
        </div>

        {/* ── Financial overview ── */}
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
            FINANCIAL OVERVIEW
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary p-4 text-white">
              <p className="text-xs text-white/80">Total Earned</p>
              <p className="mt-1 text-xl font-extrabold">
                {isLoading
                  ? '—'
                  : `₦${(metrics?.totalAmountEarned ?? 0).toLocaleString()}`}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <Wallet size={11} />
                LIFETIME COMMISSIONS
              </p>
            </div>

            <div className="rounded-2xl bg-rose-600 p-4 text-white">
              <p className="text-xs text-white/80">Suspended Referrers</p>
              <p className="mt-1 text-xl font-extrabold">
                {isLoading ? '—' : (metrics?.suspendedReferrersCount ?? 0).toLocaleString()}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <ClipboardList size={11} />
                FLAGGED ACCOUNTS
              </p>
            </div>

            {/* Total Payout — all time */}
            <div className="rounded-2xl bg-emerald-600 p-4 text-white">
              <p className="text-xs text-white/80">Total Payout</p>
              <p className="mt-1 text-xl font-extrabold">
                {isLoading
                  ? '—'
                  : `₦${(metrics?.totalPayout ?? 0).toLocaleString()}`}
              </p>
              {payoutRate !== null && !isLoading && (
                <p className="mt-1 text-[10px] text-white/70">{payoutRate}% of earned</p>
              )}
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <ArrowDownToLine size={11} />
                ALL-TIME DISBURSED
              </p>
            </div>

            {/* Total Payout This Month */}
            <div className="rounded-2xl bg-emerald-700 p-4 text-white">
              <p className="text-xs text-white/80">Payout This Month</p>
              <p className="mt-1 text-xl font-extrabold">
                {isLoading
                  ? '—'
                  : `₦${(metrics?.totalPayoutThisMonth ?? 0).toLocaleString()}`}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <ArrowDownToLine size={11} />
                {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}
              </p>
            </div>
          </div>
        </section>

        {/* ── Commissions by level ── */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-gray-900">Commissions by Level</h2>

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
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(l.commissions / maxLevelCommissions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Rewards', icon: Gift, to: '/admin/referrals/settings' },
              { label: 'Manage Cashback', icon: Banknote, to: '/admin/referrals/settings/commission' },
              { label: 'Manage Commissions', icon: GitBranch, to: '/admin/referrals/settings/commission' },
              { label: 'View Insights', icon: BarChart3, to: '/admin/referrals/insights' },
            ].map(({ label, icon: Icon, to }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(to)}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-gray-800">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Top Referrers ── */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Top Referrers</h2>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {members.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400">No referrers yet.</p>
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{m.fullname}</p>
                    <p className="text-xs text-gray-400">
                      {m.networkSize ?? 0} network · L{m.level}
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