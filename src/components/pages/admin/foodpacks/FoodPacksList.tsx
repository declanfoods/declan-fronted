import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Search, Pencil, Plus, SlidersHorizontal } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import AdminFilterSheet, {
  emptyFilterState,
  type ProductFilterState,
} from '../../../admin/AdminFilterSheet';
import {
  adminFoodPackApi,
  type AdminFoodPackSummary,
} from '../../../../app/lib/adminFoodPackApi';

const filters = ['All', 'Active', 'Inactive', 'Featured'];

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`;
}

export default function FoodPacksList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [packs, setPacks] = useState<AdminFoodPackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState<ProductFilterState>(emptyFilterState);

  const fetchPacks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFoodPackApi.getFoodPacks({
        search: search || undefined,
        status:
          activeFilter === 'Active' ? 'active' : activeFilter === 'Inactive' ? 'inactive' : undefined,
      });
      let results = res.data.data.foodpacks;
      if (activeFilter === 'Featured') {
        results = results.filter((p) => p.featuredPack);
      }
      setPacks(results);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load food packs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchPacks, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFilter]);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    adminFoodPackApi
      .getCategories()
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  const filterActiveCount =
    filterState.categoryIds.length + filterState.priceRanges.length + filterState.availability.length;

  const visiblePacks = packs.filter((pack) => {
    if (filterState.categoryIds.length > 0 && !filterState.categoryIds.includes(pack.category?.id ?? '')) {
      return false;
    }
    if (filterState.priceRanges.length > 0) {
      const matchesRange = filterState.priceRanges.some((range) => {
        if (range === '0-5000') return pack.price <= 5000;
        if (range === '5000-10000') return pack.price > 5000 && pack.price <= 10000;
        return pack.price > 10000;
      });
      if (!matchesRange) return false;
    }
    if (filterState.availability.length > 0) {
      const matches = filterState.availability.some((a) =>
        a === 'IN_STOCK' ? pack.status === 'ACTIVE' : pack.status === 'INACTIVE'
      );
      if (!matches) return false;
    }
    return true;
  });

  const handleToggleActive = async (pack: AdminFoodPackSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (pack.status === 'ACTIVE') {
        await adminFoodPackApi.deactivateFoodPack(pack.id);
      } else {
        await adminFoodPackApi.activateFoodPack(pack.id);
      }
      fetchPacks();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update food pack status.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Food Packs</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food packs..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
            filterActiveCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500'
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

        {loading && <p className="py-10 text-center text-sm text-gray-400">Loading food packs...</p>}

        {!loading && !error && visiblePacks.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No food packs found.</p>
        )}

        {!loading &&
          visiblePacks.map((pack) => (
            <div
              key={pack.id}
              className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="relative h-40 w-full bg-gray-100">
                {pack.imageUrls?.[0] && (
                  <img src={pack.imageUrls[0]} alt={pack.name} className="h-full w-full object-cover" />
                )}
                <div className="absolute left-3 top-3 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleActive(pack, e)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white ${
                      pack.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-500'
                    }`}
                  >
                    {pack.status}
                  </button>
                  {pack.featuredPack && (
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      Featured
                    </span>
                  )}
                  {pack.percentOff > 0 && (
                    <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      Save {pack.percentOff}%
                    </span>
                  )}
                </div>
              </div>

              <div
                className="cursor-pointer p-4"
                onClick={() => navigate(`/admin/food-packs/${pack.id}`)}
              >
                <h3 className="font-bold text-gray-900">{pack.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{pack.description}</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-sm text-gray-500">{pack.itemCount} Products</span>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(pack.price)}</p>
                      {pack.originalPrice > pack.price && (
                        <p className="text-xs text-gray-300 line-through">
                          {formatPrice(pack.originalPrice)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/food-packs/${pack.id}/edit`);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </main>

      <button
        type="button"
        onClick={() => navigate('/admin/food-packs/create')}
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        aria-label="Create food pack"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <AdminBottomNav />

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
