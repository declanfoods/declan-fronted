import { NavLink } from 'react-router-dom';
import { Home, Truck, Wallet, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/rider/home', label: 'Home', icon: Home },
  { to: '/rider/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/rider/earnings', label: 'Earnings', icon: Wallet },
  { to: '/rider/profile', label: 'Profile', icon: User },
];

type RiderLayoutProps = {
  children: ReactNode;
  title?: string;
  onBack?: () => void;
};

export default function RiderLayout({ children, title = 'Declan Rider' }: RiderLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-center border-b border-primary/10 bg-[#F3F7EE] px-4 py-4">
        <h1 className="text-lg font-bold text-primary">{title}</h1>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4 sm:px-6">{children}</main>

      <nav className="sticky bottom-0 z-30 border-t border-primary/10 bg-white">
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold"
              >
                {({ isActive }) =>
                  isActive ? (
                    <span className="flex flex-col items-center gap-1 rounded-2xl bg-primary px-4 py-1.5 text-white">
                      <Icon size={18} strokeWidth={2.2} />
                      <span>{label}</span>
                    </span>
                  ) : (
                    <>
                      <Icon size={20} strokeWidth={2} className="text-gray-400" />
                      <span className="text-gray-400">{label}</span>
                    </>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}