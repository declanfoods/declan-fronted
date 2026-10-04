import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Menu,
  Pencil,
  Plus,
  MoreVertical,
  AlertTriangle,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { getEffectivePrice } from '../../../../app/lib/productPricing';
import ProductActionsMenu from './ProductActionsMenu';
import AdminFilterSheet, {
  emptyFilterState,
  type ProductFilterState,
  type PriceRangeKey,
} from '../../../admin/AdminFilterSheet';
import {
  adminProductApi,
  type AdminProduct,
  type AdminProductCategory,
  type AdminPagination,
} from '../../../../app/lib/adminProductApi';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['All', 'Available', 'Out of Stock', 'Hidden'];

const filterToStatus: Record<string, string | undefined> = {
  All: undefined,
  Available: 'active',
  'Out of Stock': 'inactive',
};

const SORT_BY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Price',  value: 'price' },
  { label: 'Name',   value: 'name' },
  { label: 'Date',   value: 'date' },
  { label: 'Rating', value: 'rating' },
];

const SORT_ORDER_OPTIONS: { label: string; value: 'ASC' | 'DESC' }[] = [
  { label: 'Ascending',  value: 'ASC' },
  { label: 'Descending', value: 'DESC' },
];

// ─── URL ↔ state helpers ──────────────────────────────────────────────────────

/**
 * Read all filter/sort/page state from URLSearchParams so that the browser's
 * back button restores the exact state the admin was on before navigating to
 * a product detail page.
 */
function readParams(p: URLSearchParams): {
  search: string;
  activeFilter: string;
  sortBy: string | undefined;
  sortOrder: 'ASC' | 'DESC';
  page: number;
  filterState: ProductFilterState;
} {
  return {
    search:       p.get('q') ?? '',
    activeFilter: p.get('status') ?? 'All',
    sortBy:       p.get('sortBy') ?? undefined,
    sortOrder:    (p.get('sortOrder') as 'ASC' | 'DESC') ?? 'DESC',
    page:         Number(p.get('page') ?? '1'),
    filterState: {
      categoryIds:  p.getAll('cat'),
      priceRanges:  p.getAll('price') as PriceRangeKey[],
      availability: p.getAll('avail') as ('IN_STOCK' | 'OUT_OF_STOCK')[],
      ratings:      p.getAll('rating').map(Number),
    },
  };
}

function writeParams(
  p: URLSearchParams,
  patch: Partial<ReturnType<typeof readParams>>
): URLSearchParams {
  const next = new URLSearchParams(p);
  const cur  = readParams(p);
  const merged = { ...cur, ...patch };

  // Reset to page 1 on any filter/search/sort change
  const pageReset =
    patch.search      !== undefined ||
    patch.activeFilter !== undefined ||
    patch.sortBy       !== undefined ||
    patch.sortOrder    !== undefined ||
    patch.filterState  !== undefined;

  const setOrDelete = (key: string, val: string | undefined) => {
    if (val && val !== '' && val !== 'All' && val !== 'DESC' && val !== '1') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
  };

  setOrDelete('q',         merged.search || undefined);
  setOrDelete('status',    merged.activeFilter === 'All' ? undefined : merged.activeFilter);
  setOrDelete('sortBy',    merged.sortBy);
  setOrDelete('sortOrder', merged.sortOrder === 'DESC' ? undefined : merged.sortOrder);
  setOrDelete('page',      pageReset ? undefined : String(merged.page === 1 ? undefined : merged.page));

  // Multi-value params — delete then re-set
  next.delete('cat');
  next.delete('price');
  next.delete('avail');
  next.delete('rating');
  for (const id   of merged.filterState.categoryIds)  next.append('cat',    id);
  for (const r    of merged.filterState.priceRanges)   next.append('price',  r);
  for (const a    of merged.filterState.availability)  next.append('avail',  a);
  for (const rat  of merged.filterState.ratings)       next.append('rating', String(rat));

  return next;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  AVAILABLE:      'bg-primary text-white',
  'OUT OF STOCK': 'bg-red-600 text-white',
  HIDDEN:         'bg-gray-500 text-white',
};

// ─── SortDropdown ─────────────────────────────────────────────────────────────

interface SortDropdownProps {
  sortBy: string | undefined;
  sortOrder: 'ASC' | 'DESC' | undefined;
  onChangeSortBy: (value: string | undefined) => void;
  onChangeSortOrder: (value: 'ASC' | 'DESC') => void;
}

function SortDropdown({ sortBy, sortOrder, onChangeSortBy, onChangeSortOrder }: SortDropdownProps) {
  const [open, setOpen]       = useState(false);
  const btnRef                = useRef<HTMLButtonElement>(null);
  const panelRef              = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const openPanel = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPanelStyle({ position: 'fixed', top: rect.bottom + 8, left: rect.left, zIndex: 9999 });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = Boolean(sortBy);

  const panel = (
    <div
      ref={panelRef}
      style={panelStyle}
      className="w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      <div className="px-4 pb-2 pt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Sort by
        </p>
        {SORT_BY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChangeSortBy(sortBy === opt.value ? undefined : opt.value);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {opt.label}
            {sortBy === opt.value && <Check size={14} className="text-primary" />}
          </button>
        ))}
      </div>
      <div className="mx-4 border-t border-gray-100" />
      <div className="px-4 pb-3 pt-2">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Order
        </p>
        {SORT_ORDER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChangeSortOrder(opt.value);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {opt.label}
            {(sortOrder ?? 'DESC') === opt.value && <Check size={14} className="text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
          isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 text-gray-500'
        }`}
      >
        <ArrowUpDown size={14} />
        Sort
        {isActive && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}

// ─── ProductList ──────────────────────────────────────────────────────────────

export default function ProductList() {
  const navigate                       = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // All volatile filter/sort/page state lives in the URL
  const { search, activeFilter, sortBy, sortOrder, page, filterState } =
    readParams(searchParams);

  // Non-URL state (UI-only or server-fetched)
  const [products, setProducts]             = useState<AdminProduct[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [actionsProduct, setActionsProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories]         = useState<
    (AdminProductCategory & { productsCount?: number })[]
  >([]);
  const [filterOpen, setFilterOpen]         = useState(false);
  const [pagination, setPagination]         = useState<AdminPagination | null>(null);

  const PAGE_SIZE = 20;

  // ── setters that write back to the URL ──────────────────────────────────────

  const setSearch       = (q: string)                  => setSearchParams(writeParams(searchParams, { search: q }),       { replace: true });
  const setActiveFilter = (f: string)                  => setSearchParams(writeParams(searchParams, { activeFilter: f }), { replace: true });
  const setSortBy       = (v: string | undefined)      => setSearchParams(writeParams(searchParams, { sortBy: v }),       { replace: true });
  const setSortOrder    = (v: 'ASC' | 'DESC')          => setSearchParams(writeParams(searchParams, { sortOrder: v }),    { replace: true });
  const setPage         = (v: number | ((n: number) => number)) => {
    const next = typeof v === 'function' ? v(page) : v;
    setSearchParams(writeParams(searchParams, { page: next }), { replace: true });
  };
  const applyFilterState = (next: ProductFilterState)  => setSearchParams(writeParams(searchParams, { filterState: next }), { replace: true });

  // ── data fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    adminProductApi
      .getCategoryOverview()
      .then((res) =>
        setCategories(
          res.data.data.categories.map((c) => ({
            id:            c.id,
            name:          c.name,
            productsCount: c.productCount,
          }))
        )
      )
      .catch(() => {});
  }, []);

  const fetchProducts = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      if (activeFilter === 'Hidden') {
        const res = await adminProductApi.getHiddenProducts();
        setProducts(res.data.data.products);
        setPagination(null);
      } else {
        const res = await adminProductApi.getProducts({
          search:    search || undefined,
          status:    filterToStatus[activeFilter],
          sortBy:    sortBy,
          sortOrder: sortBy ? sortOrder : undefined,
          page:      targetPage,
          limit:     PAGE_SIZE,
          category:  filterState.categoryIds.length > 0 ? filterState.categoryIds : undefined,
        });
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever any URL param that affects the query changes
  useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(page), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFilter, sortBy, sortOrder, page, searchParams.toString()]);

  // ── action handlers ──────────────────────────────────────────────────────────

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
        quantity:  product.quantity,
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
    // Category filtering is handled server-side.

    if (filterState.priceRanges.length > 0) {
      const price = Number(product.price);
      const matchesRange = filterState.priceRanges.some((range) => {
        if (range === '0-5000')     return price <= 5000;
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

  // ── render ────────────────────────────────────────────────────────────────────

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

      {/* Filter + Sort row */}
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

        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onChangeSortBy={setSortBy}
          onChangeSortOrder={setSortOrder}
        />

        {STATUS_FILTERS.map((f) => (
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
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {product.imageUrls?.[0] && (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
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
                    {(() => {
                      const rowPricing = getEffectivePrice(product);
                      return (
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                          <p className="text-lg font-extrabold text-primary">
                            {formatPrice(String(rowPricing.price))}
                            <span className="text-xs font-medium text-gray-400">
                              {' '}/ {product.scale}
                            </span>
                          </p>
                          {rowPricing.isDiscounted && (
                            <>
                              <span className="text-sm font-medium text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                                {rowPricing.percentOff}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })()}
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

        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              Page{' '}
              <span className="font-semibold text-gray-700">{pagination.currentPage}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-700">{pagination.totalPages}</span>
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
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
            name:  actionsProduct.name,
            sku:   actionsProduct.sku,
            price: formatPrice(String(getEffectivePrice(actionsProduct).price)),
            img:   actionsProduct.imageUrls?.[0] ?? '',
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
            applyFilterState(next);
            setFilterOpen(false);
          }}
        />
      )}
    </div>
  );
}