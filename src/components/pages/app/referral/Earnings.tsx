import { useState, useEffect } from 'react';
import { Wallet, Calendar, Bell } from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import { userApi } from '../../../../app/lib/userApi';

const MOCK_HISTORY = [
  { month: 'January 2025', referrals: 4, amount: 3050, base: 1850, bonus: 1200 },
  { month: 'December 2024', referrals: 6, amount: 3050, base: 1850, bonus: 1200 },
  { month: 'November 2024', referrals: 3, amount: 3050, base: 1850, bonus: 1200 },
  { month: 'October 2024', referrals: 5, amount: 3050, base: 1850, bonus: 1200 },
];

const MOCK_CHART = [
  { month: 'Jan', value: 90 },
  { month: 'Feb', value: 30 },
  { month: 'Mar', value: 50 },
  { month: 'Apr', value: 70 },
  { month: 'May', value: 60 },
  { month: 'Jun', value: 95 },
];

export default function ReferralEarnings() {
  const [firstName, setFirstName] = useState('John');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);

  useEffect(() => {
    userApi.getProfileOverview().then((res) => {
      setFirstName(res.data.data?.user?.profile?.firstName ?? 'John');
    }).catch(() => {});
    userApi.getReferralsOverview().then((res) => {
      const m = res.data.data.metrics;
      setTotalReferrals(m?.totalDirectReferrals ?? 0);
      setActiveReferrals(m?.totalActiveReferrals ?? 0);
    }).catch(() => {});
  }, []);

  return (
    <ReferralLayout firstName={firstName}>
      {/* ═══ DESKTOP VIEW ═══ */}
      <DesktopShell
        firstName={firstName}
        totalReferrals={totalReferrals}
        activeReferrals={activeReferrals}
        totalEarnings="80,000"
        thisMonth="80,000"
        pending="80,000"
      >
        {/* Referral wallet */}
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">
            Referral Wallet - <span className="text-primary">₦3,050</span>
          </h3>
          <div className="mt-4 flex gap-3">
            <button className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-ink">
              Use on orders
            </button>
            <button className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-ink">
              Request Payment
            </button>
          </div>
        </section>

        {/* Earning history */}
        <section className="mt-6 rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Earning History</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Monthly breakdown of your referral income
          </p>

          <div className="mt-5 space-y-3">
            {MOCK_HISTORY.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{row.month}</p>
                    <p className="text-xs text-ink-soft">{row.referrals} New Referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">₦{row.amount}</p>
                  <p className="text-xs text-ink-soft">
                    ₦{row.base} + ₦{row.bonus} bonus
                  </p>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-lg font-bold text-primary">Total Lifetime Earnings</p>
              <p className="text-lg font-bold text-primary">₦14,500</p>
            </div>
          </div>
        </section>
      </DesktopShell>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden space-y-4">
        {/* Wallet */}
        <div className="rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold">₦25,000</p>
          <p className="mt-1 text-xs text-white/80">Lifetime Earnings</p>
          <p className="text-sm font-semibold">₦25,000</p>
          <button className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">
            💸 Withdraw
          </button>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Earning Trends</p>
            <button className="text-xs font-semibold text-primary">
              Last 6 Months ▾
            </button>
          </div>

          <div className="mt-4 flex h-32 items-end justify-between gap-2">
            {MOCK_CHART.map((bar) => (
              <div key={bar.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary"
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-[10px] text-ink-soft">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Recent History</p>
            <button className="text-xs font-semibold text-primary">View All</button>
          </div>
          <div className="space-y-2 rounded-2xl bg-primary/10 p-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Bell size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">
                    Referral: Chidi Okoro
                  </p>
                  <p className="text-xs text-ink-soft">New sign-up via your link</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary">Today</p>
                  <p className="text-xs font-semibold text-primary">+₦0.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReferralLayout>
  );
}
