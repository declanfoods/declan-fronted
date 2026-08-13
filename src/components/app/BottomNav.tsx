// BottomNav.tsx
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Store, ShoppingCart, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const tabs: Tab[] = [
  { to: '/app', label: 'Home', icon: Home },
  { to: '/app/orders', label: 'Orders', icon: ClipboardList },
  { to: '/app/shop', label: 'Shop', icon: Store },
  { to: '/app/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/app/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-muted bg-white/95 backdrop-blur">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.to === '/app'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-ink-soft hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={
                        'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ' +
                        (isActive ? 'bg-primary text-white' : 'text-ink-soft')
                      }
                    >
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}