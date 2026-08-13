import { NavLink, useNavigate } from 'react-router-dom';
import { User, Home, Package, LogOut } from 'lucide-react';
import logo from '../../../assets/brandlogo.png';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/rider/profile', label: 'Profile', icon: User },
  { to: '/rider/home', label: 'Home', icon: Home },
  { to: '/rider/deliveries', label: 'Deliveries', icon: Package },
];

export default function RiderLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-8">
        <img src={logo} alt="Declan Foods" className="h-10 w-auto sm:h-12" />
        <button
          type="button"
          onClick={() => navigate('/rider/login')}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-primary"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </header>

      {/* Tab nav */}
      <nav className="flex border-b border-gray-200 px-4 sm:px-8">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ' +
              (isActive
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-primary')
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}