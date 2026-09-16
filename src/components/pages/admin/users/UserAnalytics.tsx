import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Plus } from 'lucide-react';

const growth = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 48 },
  { month: 'May', value: 80 },
  { month: 'Jun', value: 88 },
];

const statusBreakdown = [
  { label: 'Active', pct: 65, color: '#2D8E2D' },
  { label: 'Inactive', pct: 25, color: '#6B7280' },
  { label: 'Suspended', pct: 10, color: '#DC2626' },
];

const referralTiers = [
  { tier: 'L1', label: 'Level 1', count: 4200, max: 4200 },
  { tier: 'L2', label: 'Level 2', count: 3100, max: 4200 },
  { tier: 'L3', label: 'Level 3', count: 1500, max: 4200 },
  { tier: 'L4', label: 'Level 4', count: 800, max: 4200 },
];

export default function UserAnalytics() {
  const navigate = useNavigate();
  const maxGrowth = Math.max(...growth.map((g) => g.value));

  let cumulativePct = 0;
  const gradientStops = statusBreakdown
    .map((s) => {
      const start = cumulativePct;
      cumulativePct += s.pct;
      return `${s.color} ${start}% ${cumulativePct}%`;
    })
    .join(', ');

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">User Analytics</h1>
        <span className="w-[22px]" aria-hidden />
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Total Customers</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">12,842</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
              <TrendingUp size={12} />
              +4.2%
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">Retention Rate</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">78%</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
              <TrendingUp size={12} />
              +2%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-primary p-5 text-white">
          <div>
            <p className="text-sm text-white/80">Active Users (Monthly)</p>
            <p className="mt-1 text-2xl font-extrabold">
              8,420 <span className="text-base font-semibold text-white/80">(65%)</span>
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Users size={20} />
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs text-gray-400">New Signups (This Month)</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">842</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Plus size={12} />
            12%
          </span>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Monthly Growth</h3>
            <span className="text-xs text-gray-400">Jan - Jun</span>
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
                  <span className="font-bold text-gray-900">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                    <span className="font-bold text-gray-900">{t.count.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(t.count / t.max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}