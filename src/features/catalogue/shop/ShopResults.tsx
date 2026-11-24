import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ApiFoodpack } from '../api/foodpackApi';
import type { ApiProduct } from '../api/productApi';
import FoodPackCard from '../components/FoodPackCard';
import ProductCard from '../components/ProductCard';

type ShopResultsProps = {
  products: ApiProduct[];
  foodPacks: ApiFoodpack[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClear?: () => void;
};

export default function ShopResults({
  products,
  foodPacks,
  page,
  totalPages,
  onPageChange,
  onClear,
}: ShopResultsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
        {foodPacks.map((pack) => <FoodPackCard key={pack.id} pack={pack} />)}
      </div>

      {products.length === 0 && foodPacks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-ink-soft">No products found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try another category or adjust your search and filters.
          </p>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Clear search and filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-ink">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}
