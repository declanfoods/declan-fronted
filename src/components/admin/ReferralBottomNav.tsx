import { NavLink } from 'react-router-dom';
import { LayoutGrid, Inbox, Users, Settings, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const tabs: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin/referrals', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/referrals/queue', label: 'Queue', icon: Inbox },
  { to: '/admin/referrals/members', label: 'Members', icon: Users },
  { to: '/admin/referrals/settings', label: 'Settings', icon: Settings },
  { to: '/admin/referrals/insights', label: 'Insights', icon: BarChart3 },
];

export default function ReferralBottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-primary/10 bg-white">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={2} className={isActive ? 'text-primary' : 'text-gray-400'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}