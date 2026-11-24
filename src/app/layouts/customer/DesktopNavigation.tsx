import { ShoppingBag, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Badge } from '../../../shared/ui/Badge';
import Logo from '../../../shared/ui/Logo';
import { isAuthenticated } from '../../../features/auth/session';
import { useCartCount } from '../../../features/cart/useCartCount';
import NotificationBell from '../../../features/notifications/components/NotificationBell';

const links = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/shop', label: 'Shop' },
  { to: '/app/orders', label: 'Orders' },
  { to: '/app/referrals/overview', label: 'Rewards', activePrefix: '/app/referrals' },
];

export default function DesktopNavigation() {
  const { pathname } = useLocation();
  const cartCount = useCartCount();
  const authenticated = isAuthenticated();

  return (
    <header className="border-b border-[#e3e9df] bg-white px-8">
      <nav
        aria-label="Customer navigation"
        className="mx-auto flex max-w-[76rem] items-center justify-between gap-6 py-2 text-sm font-semibold text-[#234a30]"
      >
        <Link to="/" aria-label="Declan Foods home" className="shrink-0">
          <Logo className="h-[72px] w-auto" />
        </Link>
        <div className="flex items-center gap-3 xl:gap-6">
          {links.map(({ to, label, end, activePrefix }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2.5 transition-colors hover:bg-[#f3f5eb] ${(isActive || (activePrefix && pathname.startsWith(activePrefix))) ? 'bg-[#e4ecd9]' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3 xl:gap-5">
          <NotificationBell />
          <Link
            to={authenticated ? '/app/profile' : '/login'}
            className="inline-flex items-center gap-2 rounded-full px-2 py-2.5 transition-colors hover:text-primary"
          >
            <UserRound size={17} aria-hidden />
            {authenticated ? 'Profile' : 'Login'}
          </Link>
          <Link
            to="/app/cart"
            className="inline-flex items-center gap-2 rounded-full bg-[#245b38] px-4 py-2.5 text-white transition-colors hover:bg-[#153526]"
          >
            <span className="relative">
              <ShoppingBag size={17} aria-hidden />
              <Badge count={cartCount} />
            </span>
            Cart
          </Link>
        </div>
      </nav>
    </header>
  );
}
