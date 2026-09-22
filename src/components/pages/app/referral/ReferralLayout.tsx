import { type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Share2, Wallet, User, Bell } from 'lucide-react';
import logo from '../../../../assets/brandlogo.png';
import {
  deriveDisplayName,
  useCustomerProfile,
  useReferralCode,
} from '../../../../app/hooks/useReferrals';

const TABS = [
  { to: '/app/referrals', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/referrals/list', label: 'Referral', icon: Users },
  { to: '/app/referrals/network', label: 'Network', icon: Share2 },
  { to: '/app/referrals/earnings', label: 'Earnings', icon: Wallet },
];

interface ReferralLayoutProps {
  children: ReactNode;
  showWelcomeBanner?: boolean;
}

/*
|--------------------------------------------------------------------------
| FIX: "why does everybody's name end in Doe?"
|--------------------------------------------------------------------------
| The mobile header below used to read `{firstName} Doe`, where:
|
|   • " Doe" was a hardcoded string literal in the JSX, and
|   • `firstName` defaulted to the literal 'John'.
|
| Two visible consequences:
|
|   Withdraw and Rewards Guide rendered <ReferralLayout> with no props, so
|   they fell through to the default and printed "John Doe" for EVERY user,
|   whoever was signed in.
|
|   The other four referral screens (Overview, Network, Referral, Earnings)
|   passed a first name, so they printed "Amadi Doe", "Lilian Doe" — a real
|   first name with an invented surname glued on.
|
| ⚠️ WHERE THE NAME COMES FROM NOW
|
| Removing the placeholder was only half the fix. The header was reading
| `GET /api/v1/referrals/code`, and that endpoint returns "profile": null for
| real accounts — so even with "Doe" gone there was no name to show and it
| fell through to the email prefix.
|
| The name is now read from `GET /api/v1/users/profile-overview`, which is
| what the Profile screen and the dashboard already use to display the
| customer's name. The referral payload stays as a fallback for the case
| where that call fails. See `deriveDisplayName` in useReferrals.ts for the
| full fallback order.
|
| Deriving it here rather than taking it as a prop is deliberate: the prop was
| optional, and the two screens that omitted it — Withdraw and Rewards Guide,
| the two this bug was reported against — were exactly the two showing
| "John Doe". A layout that supplies its own name cannot be starved of one.
*/

export default function ReferralLayout({
  children,
  showWelcomeBanner = true,
}: ReferralLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  /*
    profile-overview is the source that actually carries a name; the referral
    payload is kept as a fallback. Both are cached under their own keys, so
    revisiting a referral screen costs nothing.
  */
  const profileQuery = useCustomerProfile();
  const codeQuery = useReferralCode();

  const displayName = deriveDisplayName({
    profileOverview: profileQuery.data,
    referralCode: codeQuery.data,
  });

  /*
    Only worth a skeleton while something is genuinely still in flight. If a
    name arrived from whichever source answered first, show it immediately
    rather than holding it back for the slower of the two.
  */
  const waitingForName =
    !displayName && (profileQuery.isLoading || codeQuery.isLoading);

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

                {/*
                  Three states, and none of them invent a name:

                    loading  → a placeholder bar, so the header does not
                               visibly shift when the name arrives
                    known    → the user's real name
                    unknown  → nothing. The greeting still reads "Welcome
                               Back," and the line simply collapses.

                  Previously all three cases printed "John Doe".
                */}
                {waitingForName ? (
                  <span
                    aria-hidden
                    className="mt-1 block h-3 w-24 animate-pulse rounded-full bg-primary/15"
                  />
                ) : displayName ? (
                  <p className="text-xs text-primary">{displayName}</p>
                ) : null}
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