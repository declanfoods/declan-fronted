import { useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { emptyFilterState, type ProductFilterState } from '../filters';

import ProductFilterFields, { type CategoryOption } from './ProductFilterFields';

type ProductFilterSheetProps = {
  categories: CategoryOption[];
  value: ProductFilterState;
  onApply: (next: ProductFilterState) => void;
  onClose: () => void;
  showReview?: boolean;
};

export default function ProductFilterSheet({
  categories,
  value,
  onApply,
  onClose,
  showReview = false,
}: ProductFilterSheetProps) {
  const [draft, setDraft] = useState<ProductFilterState>(value);

  const activeCount =
    draft.categoryIds.length +
    draft.priceRanges.length +
    draft.availability.length +
    draft.ratings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center lg:hidden">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Filter products" className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col rounded-t-3xl bg-white sm:rounded-3xl">
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
          <ProductFilterFields
            categories={categories}
            value={draft}
            onChange={setDraft}
            showReview={showReview}
          />
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
