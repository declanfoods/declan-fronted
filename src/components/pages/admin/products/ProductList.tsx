import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, Menu, Pencil, Plus, MoreVertical, AlertTriangle } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import ProductActionsMenu from './ProductActionsMenu';
import AdminFilterSheet, {
  emptyFilterState,
  type ProductFilterState,
} from '../../../admin/AdminFilterSheet';
import { adminProductApi, type AdminProduct, type AdminProductCategory } from '../../../../app/lib/adminProductApi';

const filters = ['All', 'Available', 'Out of Stock', 'Hidden'];

const filterToStatus: Record<string, string | undefined> = {
  All: undefined,
  Available: 'active',
  'Out of Stock': 'inactive',
  Hidden: 'hidden',
};

function formatPrice(price: string) {
  const num = Number(price);
  return Number.isNaN(num) ? price : `₦${num.toLocaleString()}`;
}

function getStatus(product: AdminProduct): 'AVAILABLE' | 'OUT OF STOCK' | 'HIDDEN' {
  if (product.isHidden) return 'HIDDEN';
  if (product.stock_status === 'OUT_OF_STOCK' || product.quantity === 0) return 'OUT OF STOCK';
  return 'AVAILABLE';
}

const statusStyles: Record<string, string> = {
  AVAILABLE: 'bg-primary text-white',
  'OUT OF STOCK': 'bg-red-600 text-white',
  HIDDEN: 'bg-gray-500 text-white',
};

export default function ProductList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionsProduct, setActionsProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState<ProductFilterState>(emptyFilterState);

  useEffect(() => {
    adminProductApi
      .getCategories()
      .then((res) => setCategories(res.data.data.productCategories))
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminProductApi.getProducts({
        search: search || undefined,
        status: filterToStatus[activeFilter],
      });
      setProducts(res.data.data.products);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFilter]);

  const handleHideToggle = async (product: AdminProduct) => {
    try {
      if (product.isHidden) {
        await adminProductApi.unhideProduct(product.id);
      } else {
        await adminProductApi.hideProduct(product.id);
      }
      setActionsProduct(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update visibility.');
    }
  };

  const handleMarkOutOfStock = async (product: AdminProduct) => {
    try {
      await adminProductApi.updateStock(product.id, {
        quantity: product.quantity,
        operation: 'decrement',
      });
      setActionsProduct(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update stock.');
    }
  };

  const filterActiveCount =
    filterState.categoryIds.length +
    filterState.priceRanges.length +
    filterState.availability.length +
    filterState.ratings.length;

  const visibleProducts = products.filter((product) => {
    if (filterState.categoryIds.length > 0 && !filterState.categoryIds.includes(product.category?.id ?? '')) {
      return false;
    }

    if (filterState.priceRanges.length > 0) {
      const price = Number(product.price);
      const matchesRange = filterState.priceRanges.some((range) => {
        if (range === '0-5000') return price <= 5000;
        if (range === '5000-10000') return price > 5000 && price <= 10000;
        return price > 10000;
      });
      if (!matchesRange) return false;
    }

    if (filterState.availability.length > 0) {
      const inStock = product.quantity > 0 && product.stock_status !== 'OUT_OF_STOCK';
      const matchesAvailability = filterState.availability.some((a) =>
        a === 'IN_STOCK' ? inStock : !inStock
      );
      if (!matchesAvailability) return false;
    }

    return true;
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Products</h1>
        <div className="flex items-center gap-3 text-primary-dark">
          <Search size={20} strokeWidth={2} />
          <SlidersHorizontal size={20} strokeWidth={2} />
          <Menu size={20} strokeWidth={2} />
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
            filterActiveCount > 0
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filter{filterActiveCount > 0 ? ` (${filterActiveCount})` : ''}
        </button>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {loading && (
          <p className="py-10 text-center text-sm text-gray-400">Loading products...</p>
        )}

        {!loading && !error && visibleProducts.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No products found.</p>
        )}

        {!loading &&
          visibleProducts.map((product) => {
            const status = getStatus(product);
            return (
              <div key={product.id} className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative h-40 w-full bg-gray-100">
                  {product.imageUrls?.[0] && (
                    <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[status]}`}
                  >
                    {status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActionsProduct(product)}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-600"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                >
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400">
                      {product.category?.name?.toUpperCase()}
                    </p>
                    <h3 className="mt-0.5 font-bold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-lg font-extrabold text-primary">
                      {formatPrice(product.price)}
                      <span className="text-xs font-medium text-gray-400"> / {product.scale}</span>
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1 text-xs ${
                        status === 'OUT OF STOCK' ? 'text-red-500' : 'text-gray-400'
                      }`}
                    >
                      {status === 'OUT OF STOCK' && <AlertTriangle size={12} />}
                      {product.quantity} in stock
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/products/${product.id}/edit`);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            );
          })}
      </main>

      <button
        type="button"
        onClick={() => navigate('/admin/products/add')}
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        aria-label="Add product"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <AdminBottomNav />

      {actionsProduct && (
        <ProductActionsMenu
          product={{
            name: actionsProduct.name,
            sku: actionsProduct.sku,
            price: formatPrice(actionsProduct.price),
            img: actionsProduct.imageUrls?.[0] ?? '',
          }}
          isHidden={actionsProduct.isHidden}
          onClose={() => setActionsProduct(null)}
          onView={() => {
            navigate(`/admin/products/${actionsProduct.id}`);
            setActionsProduct(null);
          }}
          onEdit={() => {
            navigate(`/admin/products/${actionsProduct.id}/edit`);
            setActionsProduct(null);
          }}
          onToggleHide={() => handleHideToggle(actionsProduct)}
          onMarkOutOfStock={() => handleMarkOutOfStock(actionsProduct)}
        />
      )}

      {filterOpen && (
        <AdminFilterSheet
          categories={categories}
          value={filterState}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            setFilterState(next);
            setFilterOpen(false);
          }}
        />
      )}
    </div>
  );
}
