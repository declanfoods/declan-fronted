import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Share2,
  CheckCircle,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';

const TABS = [
  { to: '/app/referrals', label: 'Overview', end: true },
  { to: '/app/referrals/list', label: 'Referrals' },
  { to: '/app/referrals/network', label: 'Network' },
  { to: '/app/referrals/earnings', label: 'Earnings' },
];

interface DesktopShellProps {
  firstName?: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  thisMonth: string;
  pending: string;
  children: ReactNode;
  onShareLink?: () => void;
}

export default function DesktopShell({
  firstName = 'John',
  totalReferrals,
  activeReferrals,
  totalEarnings,
  thisMonth,
  pending,
  children,
  onShareLink,
}: DesktopShellProps) {
  return (
    <div className="hidden md:block">
      {/* Welcome + Share */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">
            Welcome Back, {firstName}!
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Here's your account overview and recent activity
          </p>
        </div>
        <button
          type="button"
          onClick={onShareLink}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-dark"
        >
          <Share2 size={18} />
          Share referral link
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <StatCard label="Total Referrals" value={totalReferrals} icon={Users} />
        <StatCard label="Active" value={activeReferrals} icon={CheckCircle} />
        <StatCard label="Total Earnings" value={`₦${totalEarnings}`} icon={NairaIcon} />
        <StatCard label="This Month" value={`₦${thisMonth}`} icon={Calendar} />
        <StatCard label="Pending" value={`₦${pending}`} icon={Clock} />
      </div>

      {/* Content + Sidebar layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Tabs */}
          <nav className="mb-6 flex rounded-full bg-primary p-1 shadow-sm">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  'flex-1 rounded-full py-3 text-center text-sm font-semibold transition-colors ' +
                  (isActive
                    ? 'bg-white text-primary shadow'
                    : 'text-white hover:bg-white/10')
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          {/* Main content */}
          {children}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <CommissionStructureCard />
          <QuickActionsCard onShare={onShareLink} />
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-primary">{label}</p>
        <Icon size={18} className="text-primary" />
      </div>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function NairaIcon(props: any) {
  return <span {...props} className={`font-bold ${props.className ?? ''}`}>₦</span>;
}

function CommissionStructureCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-primary">Commission Structure</h3>
      <div className="mt-4 space-y-2">
        {[
          { label: 'Level 1 Direct', value: '1.5%' },
          { label: 'Level 2', value: '0.75%' },
          { label: 'Level 3', value: '0.375%' },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-primary/40 px-4 py-2 text-sm"
          >
            <span className="text-primary">{row.label}</span>
            <span className="font-bold text-primary">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-primary">
        Commissions are paid monthly after referrals meet the ₦15,000 threshold
      </p>
    </div>
  );
}

function QuickActionsCard({ onShare }: { onShare?: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-primary">Quick Actions</h3>
      <div className="mt-4 space-y-3">
        <button
          onClick={onShare}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Share2 size={16} /> Share Referral Link
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          📥 Marketing Materials
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          👥 Invite Friends
        </button>
      </div>
    </div>
  );
}