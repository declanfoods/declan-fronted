import { Star } from 'lucide-react';
import type { PriceRangeKey, ProductFilterState } from '../filters';

export type CategoryOption = { id: string; name: string; productsCount?: number };

type ProductFilterFieldsProps = {
  categories: CategoryOption[];
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  showReview?: boolean;
};

const priceRanges: { key: PriceRangeKey; label: string }[] = [
  { key: '0-5000', label: '₦0 - ₦5,000' },
  { key: '5000-10000', label: '₦5,000 - ₦10,000' },
  { key: '10000+', label: '₦10,000+' },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
        checked ? 'border-primary bg-primary' : 'border-primary/40 bg-white'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 10" className="h-2.5 w-3 fill-none stroke-white stroke-[2]">
          <path d="M1 5l3 3 7-7" />
        </svg>
      )}
    </span>
  );
}

export default function ProductFilterFields({
  categories,
  value,
  onChange,
  showReview = false,
}: ProductFilterFieldsProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-base font-semibold text-gray-900">Category</h3>
        <div className="space-y-2.5">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400">No categories yet.</p>
          )}
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={value.categoryIds.includes(c.id)}
              onClick={() =>
                onChange({ ...value, categoryIds: toggle(value.categoryIds, c.id) })
              }
              className="flex w-full items-center gap-3 text-sm text-gray-700"
            >
              <Checkbox checked={value.categoryIds.includes(c.id)} />
              <span className="flex-1 text-left">{c.name}</span>
              {c.productsCount !== undefined && (
                <span className="text-xs font-medium text-gray-400">
                  ({c.productsCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-gray-900">Price Range</h3>
        <div className="space-y-2.5">
          {priceRanges.map((r) => (
            <button
              key={r.key}
              type="button"
              aria-pressed={value.priceRanges.includes(r.key)}
              onClick={() =>
                onChange({ ...value, priceRanges: toggle(value.priceRanges, r.key) })
              }
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <Checkbox checked={value.priceRanges.includes(r.key)} />
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-gray-900">Availability</h3>
        <div className="space-y-2.5">
          <button
            type="button"
              aria-pressed={value.availability.includes('IN_STOCK')}
            onClick={() =>
              onChange({ ...value, availability: toggle(value.availability, 'IN_STOCK') })
            }
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <Checkbox checked={value.availability.includes('IN_STOCK')} />
            In Stock
          </button>
          <button
            type="button"
              aria-pressed={value.availability.includes('OUT_OF_STOCK')}
            onClick={() =>
              onChange({ ...value, availability: toggle(value.availability, 'OUT_OF_STOCK') })
            }
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <Checkbox checked={value.availability.includes('OUT_OF_STOCK')} />
            Out Of Stock
          </button>
        </div>
      </section>

      {showReview && (
        <section>
          <h3 className="mb-2 text-base font-semibold text-gray-900">Review</h3>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={value.ratings.includes(n)}
                onClick={() => onChange({ ...value, ratings: toggle(value.ratings, n) })}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <Checkbox checked={value.ratings.includes(n)} />
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < n ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                    />
                  ))}
                </span>
                {n} Star
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Ratings aren&apos;t part of the product response yet, so this filter is visual
            only for now.
          </p>
        </section>
      )}
    </div>
  );
}
