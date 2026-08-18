import { useState } from 'react';
import { X, Star, ChevronUp } from 'lucide-react';

export type PriceRangeKey = '0-5000' | '5000-10000' | '10000+';

export type ProductFilterState = {
  categoryIds: string[];
  priceRanges: PriceRangeKey[];
  availability: ('IN_STOCK' | 'OUT_OF_STOCK')[];
  ratings: number[];
};

export const emptyFilterState: ProductFilterState = {
  categoryIds: [],
  priceRanges: [],
  availability: [],
  ratings: [],
};

type CategoryOption = { id: string; name: string };

type AdminFilterSheetProps = {
  categories: CategoryOption[];
  value: ProductFilterState;
  onApply: (next: ProductFilterState) => void;
  onClose: () => void;
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

export default function AdminFilterSheet({
  categories,
  value,
  onApply,
  onClose,
  showReview = false,
}: AdminFilterSheetProps) {
  const [draft, setDraft] = useState<ProductFilterState>(value);

  const activeCount =
    draft.categoryIds.length +
    draft.priceRanges.length +
    draft.availability.length +
    draft.ratings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col rounded-t-3xl bg-white sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary">
            <ChevronUp size={16} />
            Filter By:
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Category:</h3>
            <div className="space-y-2.5">
              {categories.length === 0 && (
                <p className="text-sm text-gray-400">No categories yet.</p>
              )}
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={draft.categoryIds.includes(c.id)}
                    onChange={() =>
                      setDraft((d) => ({ ...d, categoryIds: toggle(d.categoryIds, c.id) }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, categoryIds: toggle(d.categoryIds, c.id) }))
                    }
                  >
                    <Checkbox checked={draft.categoryIds.includes(c.id)} />
                  </button>
                  {c.name}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Price Range:</h3>
            <div className="space-y-2.5">
              {priceRanges.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, priceRanges: toggle(d.priceRanges, r.key) }))
                  }
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <Checkbox checked={draft.priceRanges.includes(r.key)} />
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Availability:</h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, availability: toggle(d.availability, 'IN_STOCK') }))
                }
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <Checkbox checked={draft.availability.includes('IN_STOCK')} />
                In Stock
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    availability: toggle(d.availability, 'OUT_OF_STOCK'),
                  }))
                }
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <Checkbox checked={draft.availability.includes('OUT_OF_STOCK')} />
                Out Of Stock
              </button>
            </div>
          </section>

          {showReview && (
            <section>
              <h3 className="mb-2 text-base font-semibold text-gray-900">Review:</h3>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, ratings: toggle(d.ratings, n) }))}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <Checkbox checked={draft.ratings.includes(n)} />
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

        <div className="flex gap-3 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={() => setDraft(emptyFilterState)}
            className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-500"
          >
            Clear{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
