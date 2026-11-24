import { useState } from 'react';
import { MapPin, RotateCcw, Search, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import { isAuthenticated } from '../../auth/session';
import ProductCard from '../../catalogue/components/ProductCard';
import { useOrdersOverview } from '../../orders/queries';
import BuyAgain from '../components/BuyAgain';
import DashboardOrders from '../components/DashboardOrders';
import { useDashboardRecommendations } from '../dashboardQueries';
import { useCustomerProfile } from '../queries';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const authenticated = isAuthenticated();
  const profile = useCustomerProfile();
  const orders = useOrdersOverview(authenticated);
  const recommendations = useDashboardRecommendations(authenticated);

  const firstName = profile.data?.profile?.firstName ?? 'there';
  const address = profile.data?.deliveryAddresses?.[0];
  const addressLabel = address ? `${address.addressLine}, ${address.state}` : 'No saved address';
  const essentials = recommendations.essentials.data ?? [];
  const buyAgainProducts = recommendations.previousPurchases.data ?? [];
  const failedQueries = [profile, orders, recommendations.essentials, recommendations.previousPurchases]
    .filter((request) => request.isError);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/app/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AppLayout title="Home">
      <div className="space-y-6">
        {authenticated && failedQueries.length > 0 && (
          <div role="status" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            Some dashboard information could not load.{' '}
            <button
              type="button"
              onClick={() => failedQueries.forEach((request) => void request.refetch())}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Greeting + location */}
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
            <MapPin size={16} strokeWidth={2} />
            <span className="max-w-[250px] truncate">{addressLabel}</span>
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-2 rounded-full border border-muted bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="flex-shrink-0 text-primary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your essentials"
              className="flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-primary/70"
            />
          </div>
        </form>

        <DashboardOrders
          orders={orders.data ?? []}
          loading={authenticated && orders.isPending}
          failed={orders.isError}
        />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/app/shop')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary py-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <Store size={22} strokeWidth={2} />
            Shop Essentials
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/orders')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary py-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <RotateCcw size={22} strokeWidth={2} />
            Reorder Last
          </button>
        </div>

        {buyAgainProducts.length > 0 && <BuyAgain products={buyAgainProducts} />}

        {/* Featured essentials */}
{essentials.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">Featured Essentials</h2>
            <div className="grid grid-cols-2 gap-4">
              {essentials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
