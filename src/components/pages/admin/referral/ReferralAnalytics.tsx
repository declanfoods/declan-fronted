import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Share2, Wallet, Lightbulb, AlertTriangle } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { topReferrers } from './mockReferralData';

const growthPoints = [10, 15, 22, 40, 55, 68, 66, 78, 90];

const commissionSlices = [
  { label: 'Level 1', pct: 72, color: '#2D8E2D' },
  { label: 'Level 2', pct: 15, color: '#BE185D' },
  { label: 'Admin', pct: 13, color: '#6B7280' },
];

export default function ReferralAnalytics() {
  const navigate = useNavigate();

  let cumulative = 0;
  const gradientStops = commissionSlices
    .map((s) => {
      const start = cumulative;
      cumulative += s.pct;
      return `${s.color} ${start}% ${cumulative}%`;
    })
    .join(', ');

  const points = growthPoints
    .map((v, i) => `${(i / (growthPoints.length - 1)) * 100},${100 - v}`)
    .join(' ');

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Qualification Rate</p>
              <ShieldCheck size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">68%</p>
            <p className="text-xs font-semibold text-primary">↗ +4.2%</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <Share2 size={16} className="text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-gray-900">12%</p>
            <p className="text-xs text-gray-400">Industry Avg: 9.4%</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-primary p-4 text-white">
          <div>
            <p className="text-sm text-white/80">Avg Referral Value</p>
            <p className="mt-1 text-2xl font-extrabold">₦8,200</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Wallet size={20} />
          </span>
        </div>

        <section className="rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Referral Growth</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              Last 30 Days
            </span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
            <polyline
              points={points}
              fill="none"
              stroke="#2D8E2D"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>WK 1</span>
            <span>WK 2</span>
            <span>WK 3</span>
            <span>WK 4</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-rose-600 p-4 text-white">
            <Lightbulb size={16} className="mb-2" />
            <p className="text-sm font-bold">Smart Insight</p>
            <p className="mt-1 text-xs text-white/90">
              Level 1 generated 72% of commissions this month.
            </p>
          </div>
          <div className="rounded-2xl bg-[#EDEFE6] p-4">
            <AlertTriangle size={16} className="mb-2 text-amber-600" />
            <p className="text-sm font-bold text-gray-900">Action Required</p>
            <p className="mt-1 text-xs text-gray-600">
              65% of members qualified. Start re-engagement.
            </p>
          </div>
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Top Referrers</h2>
            <button type="button" className="text-sm font-semibold text-primary">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {topReferrers.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                  {r.initials}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.referrals} Referrals</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    ₦{r.earnings.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">EARNINGS</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">Commission Distribution</h2>
          <div className="flex items-center justify-center gap-6 rounded-2xl border border-gray-100 p-4 shadow-sm">
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
              {commissionSlices.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-700">
                    {s.label}: <span className="font-bold text-gray-900">{s.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <ReferralBottomNav />
    </div>
  );
}