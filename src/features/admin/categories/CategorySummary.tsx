import { Info } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { CategoryKind, CategoryMetrics } from './types';

type CategorySummaryProps = {
  kind: CategoryKind;
  rowCount: number;
  metrics?: CategoryMetrics;
  loading: boolean;
  showError: boolean;
};

export default function CategorySummary({
  kind,
  rowCount,
  metrics,
  loading,
  showError,
}: CategorySummaryProps) {
  const isProducts = kind === 'products';

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-xs text-gray-500">
            {isProducts ? 'Product categories' : 'Food pack categories'}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-gray-900">
            {loading ? '—' : metrics?.numberOfCategories ?? rowCount}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-xs text-gray-500">{isProducts ? 'Products filed' : 'Packs filed'}</p>
          <p className="mt-1 text-2xl font-extrabold text-gray-900">
            {loading ? '—' : metrics?.numberOfItems ?? 0}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-xs text-gray-500">Catalog value</p>
          <p className="mt-1 text-lg font-extrabold text-primary">
            {loading ? '—' : formatNaira(metrics?.catalogValue ?? 0)}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">Stock at list price</p>
        </div>

        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-xs text-gray-500">Revenue generated</p>
          <p className="mt-1 text-lg font-extrabold text-gray-900">
            {loading ? '—' : formatNaira(metrics?.totalRevenue ?? 0)}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">From delivered orders</p>
        </div>
      </div>

      {showError && (
        <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            Could not load the totals for this tab. The categories below are current.
          </p>
        </div>
      )}
    </>
  );
}
