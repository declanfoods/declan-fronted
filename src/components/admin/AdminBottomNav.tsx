import { NavLink } from 'react-router-dom';
import { Home, Package, Users, BarChart3, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const tabs: Tab[] = [
  { to: '/admin', label: 'Home', icon: Home, end: true },
  { to: '/admin/products', label: 'Inventory', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/more', label: 'More', icon: MoreHorizontal },
];

export default function AdminBottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-primary/10 bg-white">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'
                  }`
                }
              >
                {({ isActive }) =>
                  isActive ? (
                    <span className="flex flex-col items-center gap-1 rounded-2xl bg-primary px-4 py-1.5 text-white">
                      <Icon size={18} strokeWidth={2.2} />
                      <span>{tab.label}</span>
                    </span>
                  ) : (
                    <>
                      <Icon size={20} strokeWidth={2} />
                      <span>{tab.label}</span>
                    </>
                  )
                }
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
