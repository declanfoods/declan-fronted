import { useEffect, useState } from 'react';
import { X, Package, UtensilsCrossed, Search, AlertTriangle } from 'lucide-react';
import { adminProductApi, type AdminProduct } from '../../app/lib/adminProductApi';
import { adminFoodPackApi, type AdminFoodPackSummary } from '../../app/lib/adminFoodPackApi';



type Tab = 'PRODUCT' | 'FOODPACK';


export interface OrderLine {
  id: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  quantity: number;
  // Display-only fields so the parent can render the line without re-fetching
  name: string;
  price: number;
  maxQty: number;
}

interface Props {
  lines: OrderLine[];
  onToggle: (line: OrderLine) => void;
  onClose: () => void;
}



function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

function isProductUnavailable(p: AdminProduct): boolean {
  return p.isHidden || p.stock_status === 'OUT_OF_STOCK' || p.quantity === 0;
}

function isFoodPackUnavailable(fp: AdminFoodPackSummary): boolean {
  return fp.isHidden || fp.status === 'INACTIVE';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminProductPickerSheet({ lines, onToggle, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('PRODUCT');
  const [search, setSearch] = useState('');


  const [products, setProducts]       = useState<AdminProduct[]>([]);
  const [foodPacks, setFoodPacks]     = useState<AdminFoodPackSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingFoodPacks, setLoadingFoodPacks] = useState(false);
  const [productError, setProductError]   = useState('');
  const [foodPackError, setFoodPackError] = useState('');

  // Fetch products once on mount
  useEffect(() => {
    setLoadingProducts(true);
    setProductError('');
    adminProductApi
      .getProducts({ limit: 100 })
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProductError('Failed to load products.'))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch food packs once on mount
  useEffect(() => {
    setLoadingFoodPacks(true);
    setFoodPackError('');
    adminFoodPackApi
      .getFoodPacks({ limit: 100 })
      .then((res) => setFoodPacks(res.data.data.foodpacks))
      .catch(() => setFoodPackError('Failed to load food packs.'))
      .finally(() => setLoadingFoodPacks(false));
  }, []);

  const selectedIds = new Set(lines.map((l) => l.id));
  const loading = tab === 'PRODUCT' ? loadingProducts : loadingFoodPacks;
  const fetchError = tab === 'PRODUCT' ? productError : foodPackError;

  // ── filtered lists ─────────────────────────────────────────────────────────

  const visibleProducts = products.filter(
    (p) => search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleFoodPacks = foodPacks.filter(
    (fp) => search === '' || fp.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mt-auto flex max-h-[85vh] flex-col rounded-t-3xl bg-white">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-base font-bold text-gray-900">Add Items</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="mx-5 mb-3 flex rounded-full bg-gray-100 p-1">
          {(['PRODUCT', 'FOODPACK'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setSearch(''); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'PRODUCT' ? <Package size={13} /> : <UtensilsCrossed size={13} />}
              {t === 'PRODUCT' ? 'Products' : 'Food Packs'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5">
          <Search size={15} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'PRODUCT' ? 'Search products...' : 'Search food packs...'}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {loading && (
            <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
          )}

          {!loading && fetchError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {fetchError}
            </p>
          )}

          {!loading && !fetchError && (
            <div className="space-y-2">
              {/* ── Products ── */}
              {tab === 'PRODUCT' && (
                <>
                  {visibleProducts.length === 0 && (
                    <p className="py-10 text-center text-sm text-gray-400">No products found.</p>
                  )}
                  {visibleProducts.map((product) => {
                    const unavailable = isProductUnavailable(product);
                    const selected    = selectedIds.has(product.id);
                    const price       = Number(product.price);

                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={unavailable}
                        onClick={() =>
                          onToggle({
                            id:       product.id,
                            itemType: 'PRODUCT',
                            quantity: 1,
                            name:     product.name,
                            price,
                            maxQty:   product.quantity,
                          })
                        }
                        className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                          unavailable
                            ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50'
                            : selected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white hover:border-primary/30'
                        }`}
                      >
                        {product.imageUrls?.[0] ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              unavailable ? 'bg-gray-100' : selected ? 'bg-primary/10' : 'bg-gray-100'
                            }`}
                          >
                            <Package
                              size={18}
                              className={selected && !unavailable ? 'text-primary' : 'text-gray-400'}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {product.category?.name} · {product.quantity} in stock
                          </p>
                          {unavailable && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-red-400">
                              <AlertTriangle size={11} />
                              {product.isHidden ? 'Hidden' : 'Out of stock'}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm font-bold text-primary">{fmt(price)}</p>
                          {!unavailable && (
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                selected ? 'border-primary bg-primary' : 'border-gray-300'
                              }`}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {/* ── Food Packs ── */}
              {tab === 'FOODPACK' && (
                <>
                  {visibleFoodPacks.length === 0 && (
                    <p className="py-10 text-center text-sm text-gray-400">No food packs found.</p>
                  )}
                  {visibleFoodPacks.map((fp) => {
                    const unavailable = isFoodPackUnavailable(fp);
                    const selected    = selectedIds.has(fp.id);

                    return (
                      <button
                        key={fp.id}
                        type="button"
                        disabled={unavailable}
                        onClick={() =>
                          onToggle({
                            id:       fp.id,
                            itemType: 'FOODPACK',
                            quantity: 1,
                            name:     fp.name,
                            price:    fp.price,
                            maxQty:   99, // food packs have no stock concept
                          })
                        }
                        className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                          unavailable
                            ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50'
                            : selected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white hover:border-primary/30'
                        }`}
                      >
                        {fp.imageUrls?.[0] ? (
                          <img
                            src={fp.imageUrls[0]}
                            alt={fp.name}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              unavailable ? 'bg-gray-100' : selected ? 'bg-primary/10' : 'bg-gray-100'
                            }`}
                          >
                            <UtensilsCrossed
                              size={18}
                              className={selected && !unavailable ? 'text-primary' : 'text-gray-400'}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">{fp.name}</p>
                          <p className="text-xs text-gray-400">
                            {fp.category?.name} · {fp.itemCount} item{fp.itemCount !== 1 ? 's' : ''}
                          </p>
                          {unavailable && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-red-400">
                              <AlertTriangle size={11} />
                              {fp.isHidden ? 'Hidden' : 'Inactive'}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm font-bold text-primary">{fmt(fp.price)}</p>
                          {!unavailable && (
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                selected ? 'border-primary bg-primary' : 'border-gray-300'
                              }`}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}