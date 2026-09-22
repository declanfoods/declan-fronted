import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Share2, Wallet, RefreshCw } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { useAdminReferrals } from '../../../../app/hooks/useAdminReferrals';

/*
|--------------------------------------------------------------------------
| Admin → Referral Insights — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: "68%" qualification rate, "12% vs industry 9.4%", "₦8,200 avg
| referral value", a 9-point SVG polyline drawn from a hardcoded
| `growthPoints` array, "72% Level 1 / 15% Level 2 / 13% Admin" commission
| doughnut, and a `topReferrers` list from mockReferralData.
|
| AFTER: every figure is computed from `adminReferralApi.getReferrals()`.
|
|   Qualification rate  ← networkSize > 0 as a share of all referrers
|   Avg referral value  ← mean `commissions` across loaded referrers
|   Commission split    ← real share per `level`, replacing the invented
|                         "Admin 13%" slice (there is no admin cut in the API)
|   Top referrers       ← sorted by real commission
|
| REMOVED: the trend polyline (no time-series endpoint) and the
| "Industry Avg: 9.4%" comparison (no external benchmark exists).
*/

const PAGE_SIZE = 100;

export default function ReferralAnalytics() {
  const navigate = useNavigate();

  const referralsQuery = useAdminReferrals({ page: 1, limit: PAGE_SIZE });

  const members = referralsQuery.data?.referrals ?? [];
  const pagination = referralsQuery.data?.pagination;

  const totalReferrers = pagination?.totalItems ?? members.length;
  const qualified = members.filter((m) => (m.networkSize ?? 0) > 0).length;
  const qualificationRate = members.length
    ? Math.round((qualified / members.length) * 100)
    : 0;

  const totalCommissions = members.reduce((sum, m) => sum + Number(m.commissions ?? 0), 0);
  const avgCommission = members.length
    ? Math.round(totalCommissions / members.length)
    : 0;

  // Real commission share per level.
  const byLevel = members.reduce<Record<number, number>>((acc, m) => {
    const level = Number(m.level ?? 1);
    acc[level] = (acc[level] ?? 0) + Number(m.commissions ?? 0);
    return acc;
  }, {});

  const LEVEL_COLORS = ['#2D8E2D', '#BE185D', '#6B7280', '#0E7490', '#B45309'];

  const slices = Object.entries(byLevel)
    .map(([level, amount], idx) => ({
      label: `Level ${level}`,
      amount,
      pct: totalCommissions ? Math.round((amount / totalCommissions) * 100) : 0,
      color: LEVEL_COLORS[idx % LEVEL_COLORS.length],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  let cumulative = 0;
  const gradientStops = slices
    .map((s) => {
      const start = cumulative;
      cumulative += s.pct;
      return `${s.color} ${start}% ${cumulative}%`;
    })
    .join(', ');

  const topReferrers = [...members]
    .sort((a, b) => Number(b.commissions ?? 0) - Number(a.commissions ?? 0))
    .slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => referralsQuery.refetch()}
          className="ml-auto text-primary-dark"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        {referralsQuery.isError && (
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Could not load insight data.</p>
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
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Qualification Rate</p>
              <ShieldCheck size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              {referralsQuery.isLoading ? '—' : `${qualificationRate}%`}
            </p>
            <p className="text-xs text-gray-400">
              {qualified} of {members.length} referrers
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Referrers</p>
              <Share2 size={16} className="text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-gray-900">
              {referralsQuery.isLoading ? '—' : totalReferrers.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Across all levels</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-primary p-4 text-white">
          <div>
            <p className="text-sm text-white/80">Avg Referral Value</p>
            <p className="mt-1 text-2xl font-extrabold">
              ₦{avgCommission.toLocaleString()}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Wallet size={20} />
          </span>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Referral Growth</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              By Level
            </span>
          </div>

          {slices.length === 0 && (
            <p className="py-4 text-center text-xs text-gray-400">No data yet.</p>
          )}

          <div className="space-y-3">
            {slices.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-bold text-gray-900">
                    ₦{s.amount.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-rose-600 p-4 text-white">
            <p className="text-sm font-bold">Smart Insight</p>
            <p className="mt-1 text-xs text-white/90">
              {slices[0]
                ? `${slices[0].label} generated ${slices[0].pct}% of commissions.`
                : 'No commission data yet.'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#EDEFE6] p-4">
            <p className="text-sm font-bold text-gray-900">Action Required</p>
            <p className="mt-1 text-xs text-gray-600">
              {members.length - qualified} referrers have no network yet.
            </p>
          </div>
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Top Referrers</h2>
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/members')}
              className="text-sm font-semibold text-primary"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {topReferrers.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400">
                No referrers yet.
              </p>
            )}

            {topReferrers.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/admin/referrals/members/${r.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                  {r.fullname
                    ?.split(' ')
                    .filter(Boolean)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '?'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{r.fullname}</p>
                  <p className="text-xs text-gray-400">{r.networkSize ?? 0} Referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    ₦{Number(r.commissions ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">EARNINGS</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">Commission Distribution</h2>
          <div className="flex items-center justify-center gap-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {slices.length === 0 ? (
              <p className="py-6 text-xs text-gray-400">No data yet.</p>
            ) : (
              <>
                <div
                  className="relative flex h-32 w-32 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(${gradientStops})` }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-[10px] text-gray-400">TOTAL</span>
                    <span className="text-lg font-extrabold text-gray-900">100%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {slices.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-gray-700">
                        {s.label}:{' '}
                        <span className="font-bold text-gray-900">{s.pct}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <ReferralBottomNav />
    </div>
  );
}
