import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import PageIntro from '../../../app/layouts/customer/PageIntro';
import SplashLoader from '../../../shared/ui/SplashLoader';
import type { ProductCategory } from '../api/productApi';
import { DiscountBanner } from '../components/DiscountBanner';
import ProductFilterFields from '../components/ProductFilterFields';
import ProductFilterSheet from '../components/ProductFilterSheet';
import { emptyFilterState, type ProductFilterState } from '../filters';
import ShopCategories from '../shop/ShopCategories';
import ShopResults from '../shop/ShopResults';
import { filterShopFoodPacks, filterShopProducts, type ShopTab } from '../shop/filterItems';
import { useShopItems, useShopMetadata } from '../shop/queries';
import { useShopSearch } from '../shop/useShopSearch';

const PAGE_SIZE = 10;
const emptyCategories: ProductCategory[] = [];

export default function ShopPage() {
  const { search, query, setQuery } = useShopSearch();
  const [tab, setTab] = useState<ShopTab>('all');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>(emptyFilterState);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const catalogue = useShopItems(search);
  const { categories = emptyCategories, discount } = useShopMetadata();

  useEffect(() => {
    setPage(1);
  }, [search]);

  const products = useMemo(
    () => filterShopProducts(catalogue.data?.products ?? [], categories, tab, subcategory, filters),
    [catalogue.data, categories, tab, subcategory, filters],
  );
  const foodPacks = useMemo(
    () => tab === 'all' || tab === 'discount-packs'
      ? filterShopFoodPacks(catalogue.data?.foodPacks ?? [], filters.priceRanges)
      : [],
    [catalogue.data, tab, filters.priceRanges],
  );

  const totalPages = Math.max(1, Math.ceil(Math.max(products.length, foodPacks.length) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const activeFilters = filters.categoryIds.length + filters.priceRanges.length + filters.availability.length;

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearchAndFilters = () => {
    setQuery('');
    setSubcategory(null);
    setFilters(emptyFilterState);
    setPage(1);
  };

  const applyFilters = (next: ProductFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const itemCount = products.length + foodPacks.length;

  return (
    <AppLayout
      title="Shop Essentials"
      className="lg:px-8 lg:pt-8"
      desktopNavigation
    >
      <div className="mx-auto max-w-[76rem] space-y-5 lg:space-y-8">
        <PageIntro title="Shop essentials" description="Browse everyday groceries, snacks, drinks, and food packs.">
          <div role="search" className="flex items-center gap-2 rounded-full border border-muted bg-white px-4 py-3 shadow-sm lg:gap-3 lg:border-[#ccd9cc] lg:px-5 lg:py-3.5 lg:shadow-none">
            <Search size={18} className="shrink-0 text-primary" />
            <input
              type="search"
              aria-label="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 appearance-none border-none bg-transparent text-sm text-ink outline-none placeholder:text-primary/70 [&::-webkit-search-cancel-button]:appearance-none"
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
                'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold lg:hidden ' +
                (activeFilters > 0
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted text-ink-soft')
              }
            >
              <SlidersHorizontal size={14} />
              {activeFilters > 0 ? activeFilters : ''}
            </button>
          </div>
        </PageIntro>

        {discount && !bannerDismissed && (
          <DiscountBanner discount={discount} onDismiss={() => setBannerDismissed(true)} />
        )}

        <div className="space-y-5 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
          <aside className="space-y-4 lg:rounded-3xl lg:border lg:border-[#e3e9df] lg:bg-white lg:p-5">
            <h2 className="hidden text-base font-extrabold text-[#153526] lg:block">Categories</h2>
            <ShopCategories
              categories={categories}
              tab={tab}
              subcategory={subcategory}
              onTabChange={(nextTab) => {
                setTab(nextTab);
                setSubcategory(null);
                setPage(1);
              }}
              onSubcategoryChange={(nextSubcategory) => {
                setSubcategory(nextSubcategory);
                setPage(1);
              }}
            />

            <div className="hidden border-t border-[#e3e9df] pt-5 lg:block">
              <div className="mb-5 flex items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-[#153526]">Filters</h2>
                {activeFilters > 0 && (
                  <button
                    type="button"
                    onClick={() => applyFilters(emptyFilterState)}
                    className="rounded-full px-2 py-1 text-sm font-semibold text-[#245b38] hover:bg-[#f3f5eb]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <ProductFilterFields categories={categories} value={filters} onChange={applyFilters} />
            </div>
          </aside>

          <section aria-label="Catalogue results" className="min-w-0">
            <div className="mb-5 hidden items-center justify-between gap-4 lg:flex">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#153526]">
                {query.trim() ? 'Search results' : 'Browse products'}
              </h2>
              {catalogue.data && !catalogue.isFetching && (
                <p className="shrink-0 text-sm text-[#42594a]" role="status">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
            {catalogue.isError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <p>{getApiErrorMessage(catalogue.error, 'Failed to load the catalogue. Please try again.')}</p>
                <button
                  type="button"
                  onClick={() => void catalogue.refetch()}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {catalogue.isLoading ? (
              <SplashLoader />
            ) : catalogue.isFetching ? (
              <p className="animate-pulse py-4 text-center text-sm font-medium text-primary">
                Updating catalogue...
              </p>
            ) : catalogue.isError && !catalogue.data ? null : (
              <ShopResults
                products={products.slice(start, start + PAGE_SIZE)}
                foodPacks={foodPacks.slice(start, start + PAGE_SIZE)}
                page={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                onClear={query || subcategory || activeFilters > 0 ? clearSearchAndFilters : undefined}
              />
            )}
          </section>
        </div>
      </div>

      {filterOpen && (
        <ProductFilterSheet
          categories={categories}
          value={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            applyFilters(next);
            setFilterOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}
