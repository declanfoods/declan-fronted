import { type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Share2, Wallet, User, Bell } from 'lucide-react';
import logo from '../../../../assets/brandlogo.png';

const TABS = [
  { to: '/app/referrals', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/referrals/list', label: 'Referral', icon: Users },
  { to: '/app/referrals/network', label: 'Network', icon: Share2 },
  { to: '/app/referrals/earnings', label: 'Earnings', icon: Wallet },
];

interface ReferralLayoutProps {
  children: ReactNode;
  firstName?: string;
  showWelcomeBanner?: boolean;
}

export default function ReferralLayout({
  children,
  firstName = 'John',
  showWelcomeBanner = true,
}: ReferralLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSubPage =
    location.pathname.includes('/withdraw') ||
    location.pathname.includes('/rewards-guide');

  return (
    <div className="min-h-screen bg-white">
      {/* ─── DESKTOP HEADER ─── */}
      <header className="hidden border-b border-gray-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <img src={logo} alt="Declan Foods" className="h-14 w-auto" />
          <h1 className="text-2xl font-bold text-primary">Referral Dashboard</h1>
          <button
            type="button"
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <User size={20} strokeWidth={2} />
            <span className="text-base font-semibold">My Profile</span>
          </button>
        </div>
      </header>

      {/* ─── MOBILE HEADER ─── */}
      <header className="border-b border-gray-100 md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <User size={20} className="text-gray-600" />
            </div>
            {showWelcomeBanner && (
              <div>
                <p className="text-sm font-bold text-primary">Welcome Back,</p>
                <p className="text-xs text-primary">{firstName} Doe</p>
              </div>
            )}
          </div>
          <button aria-label="Notifications" className="text-primary">
            <Bell size={22} />
          </button>
        </div>
      </header>

      {/* ─── PAGE CONTENT ─── */}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 md:pb-12">
        {/* Desktop: Welcome + Stats + Tabs live inside pages that show them */}
        {children}
      </main>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      {!isSubPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
          <div className="grid grid-cols-4">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  'flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors ' +
                  (isActive
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-primary/5')
                }
              >
                <Icon size={20} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}