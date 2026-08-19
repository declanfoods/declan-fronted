import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import AppLayout from '../../app/AppLayout';
import ProductCard from '../../ui/ProductCard';
import FoodPackCard from '../../ui/FoodPackCard';
import SplashLoader from '../../ui/SplashLoader';
import AdminFilterSheet, {
  emptyFilterState,
  type ProductFilterState,
} from '../../admin/AdminFilterSheet';
import { productApi, type ApiProduct, type ProductCategory } from '../../../app/lib/productApi';
import { foodpackApi, type ApiFoodpack } from '../../../app/lib/foodpackApi';

type ShopTab = 'all' | 'products' | 'food-packs';

const TABS: { key: ShopTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'products', label: 'Products' },
  { key: 'food-packs', label: 'Food Packs' },
];

const PAGE_SIZE = 10;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [active, setActive] = useState<ShopTab>('all');
  const [query, setQuery] = useState(initialSearch);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productsLoading, setProductsLoading] = useState(false);

  const [foodpacks, setFoodpacks] = useState<ApiFoodpack[]>([]);
  const [foodpackPage, setFoodpackPage] = useState(1);
  const [foodpackTotalPages, setFoodpackTotalPages] = useState(1);
  const [foodpacksLoading, setFoodpacksLoading] = useState(false);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState<ProductFilterState>(emptyFilterState);

  // Fetch categories once
  useEffect(() => {
    productApi.getCategories().then((res) => {
      setCategories(res.data.data.productCategories);
    }).catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    if (active === 'food-packs') return;
    setProductsLoading(true);
    productApi
      .getProducts({
        page: productPage,
        limit: PAGE_SIZE,
        search: query || undefined,
        category: selectedCategory || undefined,
      })
      .then((res) => {
        setProducts(res.data.data.products);
        setProductTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message ?? 'Failed to load products.');
      })
      .finally(() => {
        setProductsLoading(false);
        setInitialLoading(false);
      });
  }, [productPage, query, selectedCategory, active]);

  // Fetch foodpacks
  useEffect(() => {
    if (active === 'products') return;
    setFoodpacksLoading(true);
    foodpackApi
      .getFoodpacks({
        page: foodpackPage,
        limit: PAGE_SIZE,
        search: query || undefined,
      })
      .then((res) => {
        setFoodpacks(res.data.data.foodPacks);
        setFoodpackTotalPages(res.data.data.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        setFoodpacksLoading(false);
        setInitialLoading(false);
      });
  }, [foodpackPage, query, active]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProductPage(1);
      setFoodpackPage(1);
      if (query) {
        setSearchParams({ search: query });
      } else {
        setSearchParams({});
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleTabChange = (tab: ShopTab) => {
    setActive(tab);
    setProductPage(1);
    setFoodpackPage(1);
  };

  const isLoading = productsLoading || foodpacksLoading;

  const filterActiveCount =
    filterState.categoryIds.length + filterState.priceRanges.length + filterState.availability.length;

  const applyPriceAndAvailability = <T extends { price: string | number; quantity?: number }>(
    list: T[]
  ) =>
    list.filter((item) => {
      if (filterState.priceRanges.length > 0) {
        const price = Number(item.price);
        const matchesRange = filterState.priceRanges.some((range) => {
          if (range === '0-5000') return price <= 5000;
          if (range === '5000-10000') return price > 5000 && price <= 10000;
          return price > 10000;
        });
        if (!matchesRange) return false;
      }
      if (filterState.availability.length > 0 && item.quantity !== undefined) {
        const inStock = item.quantity > 0;
        const matches = filterState.availability.some((a) => (a === 'IN_STOCK' ? inStock : !inStock));
        if (!matches) return false;
      }
      return true;
    });

  const visibleProducts = applyPriceAndAvailability(
    filterState.categoryIds.length > 0
      ? products.filter((p) => filterState.categoryIds.includes(p.category?.id ?? ''))
      : products
  );

  const visibleFoodpacks = applyPriceAndAvailability(foodpacks);

  const totalPages =
    active === 'food-packs' ? foodpackTotalPages : productTotalPages;
  const currentPage =
    active === 'food-packs' ? foodpackPage : productPage;

  const handlePageChange = (page: number) => {
    if (active === 'food-packs') {
      setFoodpackPage(page);
    } else {
      setProductPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initialLoading) {
    return (
      <AppLayout title="Shop Essentials">
        <SplashLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Shop Essentials">
      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-full border border-muted bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="flex-shrink-0 text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-primary/70"
        />
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-label="Filter"
          className={
            'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ' +
            (filterActiveCount > 0
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted text-ink-soft')
          }
        >
          <SlidersHorizontal size={14} />
          {filterActiveCount > 0 ? filterActiveCount : ''}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex overflow-hidden rounded-full border-2 border-primary bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={
              'rounded-full px-5 py-2 text-sm font-semibold transition-colors ' +
              (active === tab.key
                ? 'bg-primary text-white'
                : 'text-primary hover:bg-primary/5')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      {active !== 'food-packs' && categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setProductPage(1);
            }}
            className={
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ' +
              (!selectedCategory
                ? 'bg-primary text-white'
                : 'border border-primary text-primary hover:bg-primary/5')
            }
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setProductPage(1);
              }}
              className={
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ' +
                (selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'border border-primary text-primary hover:bg-primary/5')
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="mt-6 text-center text-sm font-medium text-primary animate-pulse">
          Loading...
        </p>
      )}

      {/* Product + Foodpack grid */}
      {!isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {active !== 'food-packs' &&
            visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          {active !== 'products' &&
            visibleFoodpacks.map((pack) => (
              <FoodPackCard key={pack.id} pack={pack} />
            ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading &&
        visibleProducts.length === 0 &&
        visibleFoodpacks.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold text-ink-soft">
              No products found
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ' +
                  (currentPage === pageNum
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary bg-white text-primary hover:bg-primary/5')
                }
              >
                {pageNum}
              </button>
            );
          })}
        </div>
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
    </AppLayout>
  );
}