import { NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, LogIn } from 'lucide-react';
import { logout, isAuthenticated } from '../../app/lib/auth.ts';
interface AppMenuDropdownProps {
  onClose?: () => void;
}

const LINKS = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/orders', label: 'Orders' },
  { to: '/app/shop', label: 'Shop' },
  { to: '/app/cart', label: 'Cart' },
  { to: '/app/profile', label: 'Profile' },
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
        {LINKS.map((link) => (
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
        ))}

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