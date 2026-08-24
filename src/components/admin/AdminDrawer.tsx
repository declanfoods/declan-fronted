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
  UtensilsCrossed,
} from 'lucide-react';
import { adminLogout } from '../../app/lib/adminAuth';


type AdminDrawerProps = {
  onClose?: () => void;
  fullPage?: boolean;
};

const mainLinks = [
  { label: 'Overview', to: '/admin', icon: LayoutGrid },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Food Packs', to: '/admin/food-packs', icon: ShoppingBasket },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', to: '/admin/users', icon: Users },
];

const opsLinks = [
  { label: 'Referrals', to: '/admin/referrals', icon: Share2 },
  { label: 'Delivery', to: '/admin/delivery', icon: Truck },
  { label: 'Rider Management', to: '/admin/riders', icon: Bike },
];

const insightLinks = [{ label: 'Analytics', to: '/admin/analytics', icon: BarChart3 }];

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

  const content = (
    <div className="flex h-full w-full max-w-[380px] flex-col overflow-y-auto bg-white">
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <UtensilsCrossed size={18} strokeWidth={2} />
          </span>
          <span className="text-lg font-bold text-primary">Declan Foods</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-gray-400 hover:text-primary"
          >
            <X size={22} />
          </button>
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
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const active = currentPath === link.to;
          return (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.to)}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </button>
          );
        })}

        <p className="mb-1 mt-4 text-xs font-semibold tracking-wide text-gray-400">OPERATIONS</p>
        {opsLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.to)}
              className="flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </button>
          );
        })}

        <p className="mb-1 mt-4 text-xs font-semibold tracking-wide text-gray-400">INSIGHTS</p>
        {insightLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.to)}
              className="flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </button>
          );
        })}
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
        <img
          src="https://i.pravatar.cc/80?img=12"
          alt="Admin"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Alexander Pierce</p>
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

  if (fullPage) {
    return <div className="min-h-screen bg-white">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 h-full shadow-xl">{content}</div>
    </div>
  );
}
