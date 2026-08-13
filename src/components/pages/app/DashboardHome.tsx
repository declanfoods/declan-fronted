import { useState, useEffect } from 'react';
import { Search, MapPin, Store, RotateCcw, ShoppingCart, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../app/AppLayout';
import ProductCard from '../../ui/ProductCard';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';
import { userApi, type UserProfile, type OrderOverview } from '../../../app/lib/userApi';
import { productApi, type ApiProduct } from '../../../app/lib/productApi';
import { cartApi } from '../../../app/lib/cartApi';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderOverview[]>([]);
  const [essentials, setEssentials] = useState<ApiProduct[]>([]);
  const [buyAgainProducts, setBuyAgainProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const [profileRes, ordersRes, essentialsRes, previousRes] =
        await Promise.allSettled([
          userApi.getProfileOverview(),
          userApi.getOrdersOverview(),
          productApi.getEssentials(),
          productApi.getPreviouslyPurchased(),
        ]);

      if (profileRes.status === 'fulfilled')
        setProfile(profileRes.value.data.data);
      if (ordersRes.status === 'fulfilled')
        setOrders(ordersRes.value.data.data?.orders ?? []);
      if (essentialsRes.status === 'fulfilled')
        setEssentials(essentialsRes.value.data.data?.products ?? []);
      if (previousRes.status === 'fulfilled')
        setBuyAgainProducts(previousRes.value.data.data?.products ?? []);
    } catch {
      setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
const firstName = profile?.profile?.firstName ?? 'there';

const address = profile?.deliveryAddresses?.[0] ?? null;
const addressLabel = address
  ? `${address.addressLine}, ${address.state}`
  : 'No saved address';

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
  );
  const hasActiveOrders = activeOrders.length > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/app/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Home">
        <SplashLoader />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Home">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Home">
      <div className="space-y-6">
        {/* Greeting + location */}
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {getGreeting()}, {firstName}
          </h1>
          <button
            type="button"
            className="mt-1 flex items-center gap-1 text-sm font-medium text-primary"
          >
            <MapPin size={16} strokeWidth={2} />
            <span className="max-w-[250px] truncate">{addressLabel}</span>
            <ChevronDown size={14} strokeWidth={2} />
          </button>
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

        {/* Active orders */}
        <div className="rounded-2xl border border-primary px-6 py-8 text-center">
          {hasActiveOrders ? (
            <div>
              <h2 className="text-lg font-bold text-primary">
                {activeOrders.length} active {activeOrders.length === 1 ? 'order' : 'orders'}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {activeOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border border-primary/30 bg-white px-4 py-3"
                  >
                    <div className="text-left">
                      <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                        {order.orderNumber}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {formatNaira(Number(order.totalPrice))} · {order.totalQuantityOfItems}{' '}
                        {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/app/orders')}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                View all orders ❯
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-primary">No active orders</h2>
              <p className="mt-1 text-sm text-primary/80">
                Your essentials will appear here when you order
              </p>
              <button
                type="button"
                onClick={() => navigate('/app/shop')}
                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Start Shopping
              </button>
            </>
          )}
        </div>

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

        {/* Buy again */}
{buyAgainProducts && buyAgainProducts.length > 0 && (          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">Buy Again!</h2>
            {buyAgainProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="mb-3 flex items-center justify-between rounded-2xl border border-muted bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
{product.imageUrls?.[0] ? (
  <img
    src={product.imageUrls[0]}
    alt={product.name}
    className="h-14 w-14 rounded-xl object-cover"
  />
) : (
  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl">
    📦
  </div>
)}
<div>
  <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
    {product.category?.name ?? 'Product'}
  </span>
  <p className="mt-1 text-sm font-semibold text-primary">
    {product.name}
  </p>
  <p className="text-sm font-bold text-ink">
    {formatNaira(Number(product.price))}
  </p>
</div>
                </div>
                <button
                  type="button"
                  aria-label="Add to cart"
                  onClick={async () => {
                    try {
                      await cartApi.addItem({ productId: product.id, quantity: 1 });
                    } catch {}
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
                >
                  <ShoppingCart size={18} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Featured essentials */}
{essentials && essentials.length > 0 && (          <div>
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