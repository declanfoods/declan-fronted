import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import AppLayout from '../../app/AppLayout';
import ProductCard from '../../ui/ProductCard';
import FoodPackCard from '../../ui/FoodPackCard';
import SplashLoader from '../../ui/SplashLoader';
import AdminFilterSheet, {
  emptyFilterState,
  type ProductFilterState,
} from '../../admin/AdminFilterSheet';

import {
  productApi,
  type ApiProduct,
  type ProductCategory,
} from '../../../app/lib/productApi';

import {
  foodpackApi,
  type ApiFoodpack,
} from '../../../app/lib/foodpackApi';

import {
  discountApi,
  type GeneralDiscount,
} from '../../../app/lib/discountApi';

import { DiscountBanner } from '../../ui/DiscountBanner';

type ShopTab =
  | 'all'
  | 'foodstuffs'
  | 'fast-food'
  | 'drinks'
  | 'snacks'
  | 'discount-packs';

type ShopCategoryTab = {
  key: ShopTab;
  label: string;
};

const TABS: ShopCategoryTab[] = [
  { key: 'all', label: 'ALL' },
  { key: 'foodstuffs', label: 'FOODSTUFFS' },
  { key: 'fast-food', label: 'FAST FOOD' },
  { key: 'drinks', label: 'DRINKS' },
  { key: 'snacks', label: 'SNACKS' },
  { key: 'discount-packs', label: 'DISCOUNT PACKS' },
];

const PAGE_SIZE = 10;

/**
 * Fetch all pages returned by an API endpoint.
 *
 * The requested page size should respect the backend's configured maximum.
 * If the API caps page sizes, use that maximum here.
 */
async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{
    items: T[];
    totalPages: number;
  }>,
): Promise<T[]> {
  const limit = 100;

  const firstPage = await fetchPage(1, limit);
  const allItems = [...firstPage.items];

  if (firstPage.totalPages <= 1) {
    return allItems;
  }

  const remainingPages = await Promise.all(
    Array.from(
      { length: firstPage.totalPages - 1 },
      (_, index) => fetchPage(index + 2, limit),
    ),
  );

  for (const page of remainingPages) {
    allItems.push(...page.items);
  }

  return allItems;
}

/**
 * Shuffle an array using Fisher-Yates.
 *
 * This produces a new array and does not mutate the original.
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Normalize category names so matching does not depend on capitalization,
 * spacing, or punctuation.
 *
 * Examples:
 * "Cooked Rice"       -> "cooked rice"
 * "Drinks & Diary"    -> "drinks diary"
 * "SNACKS"            -> "snacks"
 */
function normalizeCategoryName(name?: string | null): string {
  return (name ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isFastFoodCategory(name: string): boolean {
  const normalized = normalizeCategoryName(name);

  return normalized.includes('cooked');
}

function isDrinksCategory(name: string): boolean {
  const normalized = normalizeCategoryName(name);

  return normalized.includes('drink');
}

function isSnacksCategory(name: string): boolean {
  const normalized = normalizeCategoryName(name);

  return normalized.includes('snack') || normalized.includes("biscuit");
}

function matchesMajorCategory(
  categoryName: string,
  tab: ShopTab,
): boolean {
  switch (tab) {
    case 'all':
      return true;

    case 'foodstuffs':
      return (
        !isFastFoodCategory(categoryName) &&
        !isDrinksCategory(categoryName) &&
        !isSnacksCategory(categoryName)
      );

    case 'fast-food':
      return isFastFoodCategory(categoryName);

    case 'drinks':
      return isDrinksCategory(categoryName);

    case 'snacks':
      return isSnacksCategory(categoryName);

    case 'discount-packs':
      return false;

    default:
      return true;
  }
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') ?? '';

  const [active, setActive] = useState<ShopTab>('all');
  const [query, setQuery] = useState(initialSearch);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [foodpacks, setFoodpacks] = useState<ApiFoodpack[]>([]);

  const [productPage, setProductPage] = useState(1);
  const [foodpackPage, setFoodpackPage] = useState(1);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [foodpacksLoading, setFoodpacksLoading] = useState(false);

  const [error, setError] = useState('');

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] =
    useState<ProductFilterState>(emptyFilterState);

  const [activeDiscount, setActiveDiscount] =
    useState<GeneralDiscount | null>(null);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  /**
   * Fetch categories and discounts once.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      const results = await Promise.allSettled([
        productApi.getCategories(),
        discountApi.getCurrentDiscount(),
      ]);

      if (cancelled) return;

      const categoriesResult = results[0];

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          categoriesResult.value.data.data.productCategories ?? [],
        );
      }

      const discountResult = results[1];

      if (discountResult.status === 'fulfilled') {
        setActiveDiscount(
          discountResult.value.data.data.discount ?? null,
        );
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Fetch the entire product catalogue and food-pack catalogue.
   *
   * Products are shuffled once after fetching. Pagination and category
   * switching then preserve that order for the current visit.
   */
  const loadCatalogue = useCallback(async (search: string) => {
    setProductsLoading(true);
    setFoodpacksLoading(true);
    setError('');

    try {
      const [loadedProducts, loadedFoodpacks] = await Promise.all([
        fetchAllPages<ApiProduct>(async (page, limit) => {
          const response = await productApi.getProducts({
            page,
            limit,
            search: search || undefined,
          });

          const data = response.data.data;

          return {
            items: data.products ?? [],
            totalPages: data.pagination.totalPages ?? 1,
          };
        }),

        fetchAllPages<ApiFoodpack>(async (page, limit) => {
          const response = await foodpackApi.getFoodpacks({
            page,
            limit,
            search: search || undefined,
          });

          const data = response.data.data;

          return {
            items: data.foodPacks ?? [],
            totalPages: data.pagination.totalPages ?? 1,
          };
        }),
      ]);

      setProducts(shuffle(loadedProducts));
      setFoodpacks(shuffle(loadedFoodpacks));

      setProductPage(1);
      setFoodpackPage(1);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data
          ? String(err.response.data.message)
          : 'Failed to load the catalogue. Please try again.';

      setError(message);
    } finally {
      setProductsLoading(false);
      setFoodpacksLoading(false);
      setInitialLoading(false);
    }
  }, []);

  /**
   * Debounce search requests.
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmedQuery = query.trim();

      if (trimmedQuery) {
        setSearchParams({ search: trimmedQuery });
      } else {
        setSearchParams({});
      }

      loadCatalogue(trimmedQuery);
    }, query === initialSearch ? 0 : 400);

    return () => window.clearTimeout(timeout);
  }, [query, initialSearch, loadCatalogue, setSearchParams]);

  /**
   * Map product category IDs to names dynamically using the categories
   * returned by the API. No category IDs are hardcoded.
   */
  const categoryNameById = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ]),
    );
  }, [categories]);

  const getProductCategoryName = useCallback(
    (product: ApiProduct): string => {
      const directName = product.category?.name;

      if (directName) {
        return directName;
      }

      const categoryId = product.category?.id;

      return categoryId
        ? categoryNameById.get(categoryId) ?? ''
        : '';
    },
    [categoryNameById],
  );

  /**
   * Display the subcategories belonging to the selected major category.
   *
   * The subcategory buttons use API-provided IDs for filtering, while
   * category grouping is determined by category names.
   */
  const visibleSubcategories = useMemo(() => {
    return categories.filter((category) =>
      matchesMajorCategory(category.name, active),
    );
  }, [categories, active]);

  /**
   * Reset the selected subcategory when switching major categories.
   */
  const handleTabChange = (tab: ShopTab) => {
    setActive(tab);
    setSelectedSubcategory(null);
    setProductPage(1);
    setFoodpackPage(1);
  };

  /**
   * Apply the current tab and subcategory selection.
   */
  const tabProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryName = getProductCategoryName(product);

      if (!matchesMajorCategory(categoryName, active)) {
        return false;
      }

      if (
        selectedSubcategory &&
        product.category?.id !== selectedSubcategory
      ) {
        return false;
      }

      return true;
    });
  }, [
    products,
    active,
    selectedSubcategory,
    getProductCategoryName,
  ]);

  /**
   * Apply filters to the already selected product group.
   */
  const filteredProducts = useMemo(() => {
    return tabProducts.filter((product) => {
      if (
        filterState.categoryIds.length > 0 &&
        !filterState.categoryIds.includes(product.category?.id ?? '')
      ) {
        return false;
      }

      if (filterState.priceRanges.length > 0) {
        const price = Number(product.price);

        const matchesRange = filterState.priceRanges.some((range) => {
          if (range === '0-5000') {
            return price >= 0 && price <= 5000;
          }

          if (range === '5000-10000') {
            return price > 5000 && price <= 10000;
          }

          return price > 10000;
        });

        if (!matchesRange) return false;
      }

      if (
        filterState.availability.length > 0 &&
        product.quantity !== undefined
      ) {
        const inStock = product.quantity > 0;

        const matchesAvailability = filterState.availability.some(
          (availability) =>
            availability === 'IN_STOCK'
              ? inStock
              : !inStock,
        );

        if (!matchesAvailability) return false;
      }

      return true;
    });
  }, [tabProducts, filterState]);


const filteredFoodpacks = useMemo(() => {
  if (active !== 'all' && active !== 'discount-packs') {
    return [];
  }

  return foodpacks.filter((pack) => {
    if (filterState.priceRanges.length > 0) {
      const price = Number(pack.price);

      const matchesRange = filterState.priceRanges.some((range) => {
        if (range === '0-5000') {
          return price >= 0 && price <= 5000;
        }

        if (range === '5000-10000') {
          return price > 5000 && price <= 10000;
        }

        return price > 10000;
      });

      if (!matchesRange) return false;
    }

    return true;
  });
}, [foodpacks, active, filterState.priceRanges]);


  /**
   * ALL shows both products and food packs.
   *
   * Other tabs display their respective product groups.
   */
  const showProducts = active !== 'discount-packs';
  const showFoodpacks =
    active === 'all' || active === 'discount-packs';

  /**
   * Paginate the filtered arrays locally.
   */
  const productTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const foodpackTotalPages = Math.max(
    1,
    Math.ceil(filteredFoodpacks.length / PAGE_SIZE),
  );

  const currentProducts = useMemo(() => {
    const start = (productPage - 1) * PAGE_SIZE;

    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, productPage]);

  const currentFoodpacks = useMemo(() => {
    const start = (foodpackPage - 1) * PAGE_SIZE;

    return filteredFoodpacks.slice(start, start + PAGE_SIZE);
  }, [filteredFoodpacks, foodpackPage]);

  const totalPages =
    active === 'discount-packs'
      ? foodpackTotalPages
      : active === 'all'
        ? Math.max(productTotalPages, foodpackTotalPages)
        : productTotalPages;

  const currentPage =
    active === 'discount-packs'
      ? foodpackPage
      : productPage;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setProductPage(page);
    setFoodpackPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const filterActiveCount =
    filterState.categoryIds.length +
    filterState.priceRanges.length +
    filterState.availability.length;

  const isLoading = productsLoading || foodpacksLoading;

  const noResults =
    (!showProducts || currentProducts.length === 0) &&
    (!showFoodpacks || currentFoodpacks.length === 0);

  if (initialLoading) {
    return (
      <AppLayout title="Shop Essentials">
        <SplashLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Shop Essentials">
      <div className="space-y-5">
        {/* Search and filters */}
        <div className="flex items-center gap-2 rounded-full border border-muted bg-white px-4 py-3 shadow-sm">
          <Search
            size={18}
            className="shrink-0 text-primary"
          />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-primary/70"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-medium text-primary"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Filter products"
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

        {/* Active discount banner */}
        {activeDiscount && !bannerDismissed && (
          <DiscountBanner
            discount={activeDiscount}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Major category navigation */}
        <nav
          aria-label="Shop categories"
          className="-mx-1 overflow-x-auto px-1 pb-2"
        >
          <div className="flex w-max min-w-full gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                aria-pressed={active === tab.key}
                className={
                  'whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ' +
                  (active === tab.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/20 bg-white text-primary hover:bg-primary/5')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Dynamic subcategories */}
        {active !== 'all' &&
          active !== 'discount-packs' &&
          visibleSubcategories.length > 0 && (
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex w-max gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubcategory(null);
                    setProductPage(1);
                  }}
                  aria-pressed={selectedSubcategory === null}
                  className={
                    'whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ' +
                    (selectedSubcategory === null
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600')
                  }
                >
                  All
                </button>

                {visibleSubcategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubcategory(
                        selectedSubcategory === category.id
                          ? null
                          : category.id,
                      );

                      setProductPage(1);
                    }}
                    aria-pressed={
                      selectedSubcategory === category.id
                    }
                    className={
                      'whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ' +
                      (selectedSubcategory === category.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-600')
                    }
                  >
                    {category.name}
                    {category.productsCount !== undefined && (
                      <span className="ml-1 opacity-70">
                        ({category.productsCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Errors */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => loadCatalogue(query.trim())}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <p className="animate-pulse py-4 text-center text-sm font-medium text-primary">
            Updating catalogue...
          </p>
        )}

        {/* Product and food-pack grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {showProducts &&
                currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              {showFoodpacks &&
                currentFoodpacks.map((pack) => (
                  <FoodPackCard
                    key={pack.id}
                    pack={pack}
                  />
                ))}
            </div>

            {/* Empty state */}
            {noResults && (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-ink-soft">
                  No products found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Try another category or adjust your search and filters.
                </p>

                {(query || selectedSubcategory || filterActiveCount > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSelectedSubcategory(null);
                      setFilterState(emptyFilterState);
                      setProductPage(1);
                      setFoodpackPage(1);
                    }}
                    className="mt-3 text-sm font-semibold text-primary hover:underline"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-semibold text-ink">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product filters */}
      {filterOpen && (
        <AdminFilterSheet
          categories={categories}
          value={filterState}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            setFilterState(next);
            setProductPage(1);
            setFoodpackPage(1);
            setFilterOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}
