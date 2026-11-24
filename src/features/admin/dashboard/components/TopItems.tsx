import { Package, ShoppingBasket } from 'lucide-react';
import { formatNaira } from '../../../../shared/formatters/formatNaira';
import type { DashboardTopItem } from '../api';

function TopItemRow({
  item,
  isProduct,
}: {
  item: DashboardTopItem;
  isProduct: boolean;
}) {
  const thumb = item.imageUrls?.[0];

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt={item.name}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F7EE] text-primary">
            {isProduct ? <Package size={16} /> : <ShoppingBasket size={16} />}
          </span>
        )}
        <p className="min-w-0 truncate text-sm font-medium text-gray-700">
          {item.name}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-primary">
          {Number(item.totalSold ?? 0)} Sold
        </p>
        <p className="text-xs text-gray-400">
          {formatNaira(Number(item.totalRevenue ?? 0))}
        </p>
      </div>
    </div>
  );
}

interface TopItemsProps {
  kind: 'products' | 'food-packs';
  items: DashboardTopItem[];
}

export default function TopItems({ kind, items }: TopItemsProps) {
  const isProduct = kind === 'products';

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-gray-900">
        {isProduct ? 'Top Products' : 'Top Food Packs'}
      </h2>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">
          {isProduct ? 'No product sales yet.' : 'No food pack sales yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => <TopItemRow key={item.itemId} item={item} isProduct={isProduct} />)}
        </div>
      )}
    </section>
  );
}
