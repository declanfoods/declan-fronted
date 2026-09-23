import { NavLink, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingCart, Users, MoreHorizontal, ClipboardList, User, X } from 'lucide-react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

type Tab = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const tabs: Tab[] = [
  { to: '/app',                label: 'Home',     icon: Home },
  { to: '/app/referrals/overview', label: 'Referral', icon: Users },
  { to: '/app/shop',           label: 'Shop',     icon: Store },
  { to: '/app/cart',           label: 'Cart',     icon: ShoppingCart },  
];

const moreItems = [
  { to: '/app/orders',   label: 'Orders',  icon: ClipboardList },
  { to: '/app/profile',  label: 'Profile', icon: User },
];

const MORE_ROUTES = ['/app/orders', '/app/profile'];

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreIsActive = MORE_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More bottom sheet */}
      {moreOpen && (
        <div className="fixed bottom-20 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-2xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">More</span>
            <button onClick={() => setMoreOpen(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={2} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom nav */}
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

          {/* More — 5th slot */}
          <li>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex w-full flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ${
                moreIsActive || moreOpen ? 'text-primary' : 'text-ink-soft hover:text-primary'
              }`}
            >
              <span
                className={
                  'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ' +
                  (moreIsActive || moreOpen ? 'bg-primary text-white' : 'text-ink-soft')
                }
              >
                <MoreHorizontal size={22} strokeWidth={2} />
              </span>
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}