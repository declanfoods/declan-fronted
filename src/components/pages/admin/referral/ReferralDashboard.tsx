import { useNavigate } from 'react-router-dom';
import {
  Menu,
  TrendingUp,
  ShieldCheck,
  ClipboardList,
  Wallet,
  RotateCcw,
  BarChart3,
  Gift,
  Banknote,
  GitBranch,
  Star,
  UserPlus,
  ShoppingBag,
  ShieldQuestion,
  ChevronRight,
} from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { referralInsights } from './mockReferralData';

const growthBars = [30, 45, 40, 60, 55, 90];

const insightIcons = {
  commission: UserPlus,
  cashback: ShoppingBag,
  tier: Star,
  qualification: ShieldQuestion,
};

export default function ReferralDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" aria-label="Menu" className="text-primary-dark">
          <Menu size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral Dashboard</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Referral Network</p>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              <TrendingUp size={12} />
              +12%
            </span>
          </div>
          <p className="text-2xl font-extrabold text-primary">12,842</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">4,200</p>
              <p className="text-xs text-gray-400">Qualified</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <ClipboardList size={18} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">1,150</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
            FINANCIAL OVERVIEW
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary p-4 text-white">
              <p className="text-xs text-white/80">Total Rewards Paid</p>
              <p className="mt-1 text-xl font-extrabold">₦4.2M</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <Wallet size={11} />
                DISBURSED
              </p>
            </div>
            <div className="rounded-2xl bg-rose-600 p-4 text-white">
              <p className="text-xs text-white/80">Total Cashback</p>
              <p className="mt-1 text-xl font-extrabold">₦850k</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <RotateCcw size={11} />
                PROCESSED
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Growth &amp; Trends</h2>
              <p className="text-xs text-gray-400">Referral Growth</p>
            </div>
            <span className="text-xs font-semibold text-primary">Past 30 Days</span>
          </div>
          <p className="mb-2 text-lg font-extrabold text-gray-900">+2,408 users</p>
          <div className="flex h-24 items-end gap-2">
            {growthBars.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md ${
                  i === growthBars.length - 1 ? 'bg-primary' : 'bg-primary/20'
                }`}
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600">
              8 Payouts Pending
            </span>
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
              onClick={() => navigate('/admin/referrals/queue')}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
                <BarChart3 size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800">Review Payouts</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-900">Referral Insights</h2>
          <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
            {referralInsights.map((item) => {
              const Icon = insightIcons[item.icon];
              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-3 w-full text-center text-sm font-semibold text-primary"
          >
            View All Activity
          </button>
        </section>
      </main>

      <ReferralBottomNav />
    </div>
  );
}