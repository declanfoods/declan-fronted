import { NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, LogIn, ExternalLink } from 'lucide-react';
import { logout, isAuthenticated } from '../../app/lib/auth.ts';

interface AppMenuDropdownProps {
  onClose?: () => void;
}

/*
|--------------------------------------------------------------------------
| Hamburger menu
|--------------------------------------------------------------------------
| Cart was replaced with Referrals — referrals are part of the product rather
| than somewhere you pass through on the way to checkout, and the cart still
| has its own tab in the bottom nav.
|
| ⚠️ `newTab: true` RENDERS A REAL <a>, NOT A NavLink.
|
| Opening a new browser tab is only possible through a genuine anchor. A
| <button onClick={navigate}> never can, and window.open() is silently blocked
| by popup blockers on mobile. So Referrals is an <a target="_blank"> and the
| rest stay NavLinks — which also means it never shows as "active", because
| you left this tab rather than navigating within it.
|
| This matches "View Full Referral Dashboard" on the Profile screen, which has
| been a target="_blank" anchor all along. Both now go to the same place.
*/
type MenuLink = {
  to: string;
  label: string;
  end?: boolean;
  /** Opens in a new browser tab. Renders an <a> instead of a NavLink. */
  newTab?: boolean;
};

const LINKS: MenuLink[] = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/orders', label: 'Orders' },
  { to: '/app/shop', label: 'Shop' },
  { to: '/app/profile', label: 'Profile' },
  { to: '/app/referrals', label: 'Referrals', newTab: true },
];

export default function AppMenuDropdown({ onClose }: AppMenuDropdownProps) {
const navigate = useNavigate();
const loggedIn = isAuthenticated();

const handleLogin = () => {
  onClose?.();
  navigate('/login');
};
  const handleLogout = () => {
    onClose?.();
    logout();
  };

  return (
    <div className="rounded-2xl bg-white px-6 py-8 shadow-md">
      <nav className="flex flex-col items-center gap-5">
        {LINKS.map((link) => {
          if (link.newTab) {
            return (
              <a
                key={link.to}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-2 text-xl font-medium text-primary/70 transition-colors hover:text-primary"
              >
                {link.label}
                {/* Signals "this leaves this tab" so it isn't a surprise. */}
                <ExternalLink size={18} strokeWidth={2} aria-hidden className="text-accent" />
              </a>
            );
          }

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'text-xl font-bold text-primary'
                  : 'text-xl font-medium text-primary/70 transition-colors hover:text-primary'
              }
            >
              {link.label}
            </NavLink>
          );
        })}

        {/* Logout button */}
{loggedIn ? (
  <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-xl font-medium text-red-500 transition-colors hover:text-red-600">
    <LogOut size={20} strokeWidth={2} />
    Logout
  </button>
) : (
  <button type="button" onClick={handleLogin} className="flex items-center gap-2 text-xl font-medium text-primary transition-colors hover:text-primary-dark">
    <LogIn size={20} strokeWidth={2} />
    Login
  </button>
)}
      </nav>

      <div className="mt-8 flex items-center gap-2 rounded-full border border-primary px-4 py-3">
        <Search size={18} className="flex-shrink-0 text-primary" />
        <input
          type="text"
          placeholder="Search Product"
          className="flex-1 border-none bg-transparent text-sm font-semibold text-primary outline-none placeholder:text-primary placeholder:font-semibold"
        />
      </div>
    </div>
  );
}
