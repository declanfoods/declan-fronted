import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import AppLayout from '../../app/AppLayout';
import ProductCard from '../../ui/ProductCard';
import FoodPackCard from '../../ui/FoodPackCard';
import SplashLoader from '../../ui/SplashLoader';
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
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          {active !== 'products' &&
            foodpacks.map((pack) => (
              <FoodPackCard key={pack.id} pack={pack} />
            ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading &&
        products.length === 0 &&
        foodpacks.length === 0 && (
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
    </AppLayout>
  );
}