import { useState } from 'react';
import { ArrowUpRight, MapPin, RotateCcw, Search, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import PageIntro from '../../../app/layouts/customer/PageIntro';
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
    <AppLayout title="Home" className="lg:px-8 lg:pt-8" desktopNavigation>
      <div className="mx-auto max-w-[76rem] space-y-6 lg:space-y-8">
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

        <PageIntro
          title={`${getGreeting()}, ${firstName}`}
          showIntroOnMobile
          description={(
            <p className="flex items-center gap-2 font-medium">
              <MapPin size={16} aria-hidden className="shrink-0" />
              <span className="truncate">{addressLabel}</span>
            </p>
          )}
        >
          <form onSubmit={handleSearch} role="search">
            <div className="flex items-center gap-2 rounded-full border border-muted bg-white px-4 py-3 shadow-sm lg:gap-3 lg:border-[#ccd9cc] lg:py-2 lg:pl-5 lg:pr-2 lg:shadow-none">
              <Search size={18} aria-hidden className="shrink-0 text-primary" />
              <input
                type="search"
                aria-label="Search your essentials"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your essentials"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-primary/70"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="hidden rounded-full bg-[#245b38] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#153526] disabled:opacity-60 lg:block"
              >
                Search
              </button>
            </div>
          </form>
        </PageIntro>

        <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
          <DashboardOrders
            orders={orders.data ?? []}
            loading={authenticated && orders.isPending}
            failed={orders.isError}
          />

          <section aria-label="Shopping shortcuts" className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <Link
              to="/app/shop"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary py-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark lg:flex-row lg:justify-start lg:gap-3 lg:bg-[#245b38] lg:px-6 lg:hover:bg-[#153526]"
            >
              <Store size={22} aria-hidden />
              Shop Essentials
              <ArrowUpRight size={18} aria-hidden className="ml-auto hidden lg:block" />
            </Link>
            <Link
              to="/app/orders"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary py-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 lg:flex-row lg:justify-start lg:gap-3 lg:border-[#ccd9cc] lg:px-6 lg:text-[#245b38] lg:hover:bg-[#f3f5eb]"
            >
              <RotateCcw size={22} aria-hidden />
              Reorder Last
              <ArrowUpRight size={18} aria-hidden className="ml-auto hidden lg:block" />
            </Link>
          </section>
        </div>

        {buyAgainProducts.length > 0 && <BuyAgain products={buyAgainProducts} />}

        {essentials.length > 0 && (
          <section aria-labelledby="featured-essentials">
            <div className="mb-3 lg:mb-5 lg:flex lg:items-center lg:justify-between lg:gap-4">
              <h2 id="featured-essentials" className="text-lg font-bold text-ink lg:text-2xl lg:font-extrabold lg:tracking-tight lg:text-[#153526]">
                Featured Essentials
              </h2>
              <Link
                to="/app/shop"
                className="hidden items-center gap-2 rounded-full border border-[#ccd9cc] px-5 py-3 text-sm font-semibold text-[#245b38] hover:bg-[#f3f5eb] lg:inline-flex"
              >
                Browse shop <ArrowUpRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {essentials.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
