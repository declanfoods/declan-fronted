import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  Package,
  ShoppingBasket,
  ShoppingCart,
  Users,
  Share2,
  Truck,
  Bike,
  BarChart3,
  PlusCircle,
  PackagePlus,
  FileEdit,
  UserPlus,
  LogOut,
  X,
  ArrowLeft,
  ExternalLink,
  FolderTree,
  CreditCard,
  History,
} from 'lucide-react';
import { adminLogout } from '../../app/lib/adminAuth';
// Same asset the public site uses (see components/ui/Logo.tsx).
import brandLogo from '../../assets/brandlogo.png';


type AdminDrawerProps = {
  onClose?: () => void;
  fullPage?: boolean;
};

/*
|--------------------------------------------------------------------------
| Nav model
|--------------------------------------------------------------------------
| `newTab: true` renders a real <a target="_blank"> instead of doing an in-app
| navigation. Opening a new browser tab is ONLY possible through a genuine
| anchor — a <button onClick={navigate}> can never do it, and window.open()
| gets silently blocked by popup blockers on mobile.
|
| Per request: "Users" (Admin User Management) and "Referrals" (Referral
| Dashboard) each open in their own blank tab, so an admin can keep this
| screen open while working in them. Delete the `newTab: true` line on either
| to put it back to normal in-app navigation.
*/
type DrawerLink = {
  label: string;
  to: string;
  icon: typeof LayoutGrid;
  newTab?: boolean;
};

const mainLinks: DrawerLink[] = [
  { label: 'Overview', to: '/admin', icon: LayoutGrid },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Food Packs', to: '/admin/food-packs', icon: ShoppingBasket },
  // Catalogue structure — product + food pack categories.
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  // Admin User Management — new blank tab.
  { label: 'Users', to: '/admin/users', icon: Users, newTab: true },
];

const opsLinks: DrawerLink[] = [
  // Payment methods an admin switches on and off at checkout.
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  // The stock ledger — every change to product stock.
  { label: 'Stock History', to: '/admin/stocks', icon: History },
  // Referral Dashboard — new blank tab.
  { label: 'Referrals', to: '/admin/referrals', icon: Share2, newTab: true },
  // FIX: this pointed at '/admin/delivery', which has NO route defined in
  // App.tsx. Clicking it fell through to the catch-all `path="*"`, so an admin
  // tapping "Delivery" was dumped on the public marketing homepage.
  // Delivery operations (assign rider, update status) live under /admin/orders.
  { label: 'Delivery', to: '/admin/orders', icon: Truck },
  { label: 'Rider Management', to: '/admin/riders', icon: Bike },
];

const insightLinks: DrawerLink[] = [
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

const quickActions = [
  { label: 'Add Product', to: '/admin/products/add', icon: PlusCircle },
  { label: 'Food Pack', to: '/admin/food-packs/create', icon: PackagePlus },
  { label: 'Create Order', to: '/admin/orders', icon: FileEdit },
  { label: 'Onboard Rider', to: '/admin/riders/onboard', icon: UserPlus },
];

export default function AdminDrawer({ onClose, fullPage }: AdminDrawerProps) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const go = (to: string) => {
    navigate(to);
    onClose?.();
  };

  /*
    Renders one nav row. Links flagged `newTab` become real anchors so the
    browser opens them in a new tab; everything else stays an in-app button.
    The anchor also closes the drawer, so returning to this tab leaves you on
    a tidy screen rather than an open menu.
  */
  const renderLink = (link: DrawerLink, opts: { active?: boolean; tone?: 'plain' | 'primary' } = {}) => {
    const Icon = link.icon;
    const active = opts.active ?? false;
    const tone = opts.tone ?? 'plain';

    const classes = `flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
      active
        ? 'bg-primary text-white'
        : tone === 'primary'
          ? 'text-primary-dark hover:bg-primary/10'
          : 'text-gray-700 hover:bg-gray-50'
    }`;

    if (link.newTab) {
      return (
        <a
          key={link.label}
          href={link.to}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClose?.()}
          className={classes}
        >
          <Icon size={18} strokeWidth={2} />
          <span className="flex-1">{link.label}</span>
          {/* Signals "this leaves this tab" so it isn't a surprise. */}
          <ExternalLink size={14} className={active ? 'text-white/70' : 'text-gray-300'} />
        </a>
      );
    }

    return (
      <button key={link.label} type="button" onClick={() => go(link.to)} className={classes}>
        <Icon size={18} strokeWidth={2} />
        <span className="flex-1">{link.label}</span>
      </button>
    );
  };

  const content = (fullPage: boolean) => (
    <div className="flex h-full w-full max-w-[380px] flex-col overflow-y-auto bg-white">
      <div className="flex items-center justify-between px-5 pt-6">
        {/*
          Was a green circle with a generic cutlery glyph — a placeholder that
          shipped. Now the real brand mark.
        */}
        <div className="flex items-center gap-2">
          <img
            src={brandLogo}
            alt="Declan Foods"
            className="h-9 w-9 rounded-full object-contain"
          />
          <span className="text-lg font-bold text-primary">Declan Foods</span>
        </div>
        {/*
          Overlay mode: ✕ closes it.
          Full-page mode (/admin/more): there is no overlay to dismiss, so an
          explicit Back control returns to the dashboard. Previously this slot
          rendered NOTHING here and the page was a dead end.
        */}
        {fullPage ? (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            aria-label="Back to dashboard"
            className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="text-gray-400 hover:text-primary"
            >
              <X size={22} />
            </button>
          )
        )}
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search menu..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <nav className="mt-5 flex flex-col gap-1 px-5">
        <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400">MAIN</p>
        {mainLinks.map((link) => renderLink(link, { active: currentPath === link.to }))}

        <p className="mb-1 mt-4 text-xs font-semibold tracking-wide text-gray-400">OPERATIONS</p>
        {opsLinks.map((link) => renderLink(link, { active: currentPath === link.to }))}

        <p className="mb-1 mt-4 text-xs font-semibold tracking-wide text-gray-400">INSIGHTS</p>
        {insightLinks.map((link) => renderLink(link, { active: currentPath === link.to }))}
      </nav>

      <div className="mt-6 px-5">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => go(action.to)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-[#F3F7EE] py-4 text-xs font-semibold text-primary-dark hover:bg-primary/10"
              >
                <Icon size={20} strokeWidth={2} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-gray-100 px-5 py-4">
        {/*
          Was a random stock face from i.pravatar.cc ("Alexander Pierce") —
          a placeholder person, and an external image call on every open.
          Now the company mark. The "Senior Admin" role label stays.
        */}
        <img
          src={brandLogo}
          alt="Declan Foods"
          className="h-10 w-10 rounded-full bg-white object-contain"
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Declan Foods</p>
          <p className="text-xs text-gray-400">Senior Admin</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
          v1.0.0
        </span>
      </div>

      <button
        type="button"
        onClick={adminLogout}
        className="mx-5 mb-6 flex items-center gap-2 text-sm font-semibold text-red-500"
      >
        <LogOut size={16} strokeWidth={2} />
        Logout
      </button>
    </div>
  );

  /*
  |--------------------------------------------------------------------------
  | FIX: /admin/more had no way out
  |--------------------------------------------------------------------------
  | In `fullPage` mode this rendered the drawer body as a standalone page with
  | no header control at all: the ✕ only renders when `onClose` is passed, and
  | the /admin/more route passes nothing. The only escape was the browser's
  | back button — which on a PWA feels like being stuck.
  |
  | `content` now takes a `fullPage` flag so the header renders a labelled
  | Back control that returns to the admin dashboard.
  */
  if (fullPage) {
    return <div className="min-h-screen bg-white">{content(true)}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 h-full shadow-xl">{content(false)}</div>
    </div>
  );
}