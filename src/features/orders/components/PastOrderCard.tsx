import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { Order } from '../api/orderApi';
import { formatOrderDate, orderStatusKey, orderStatusLabel } from '../orderPresentation';

const PAST_STATUS_PILL: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  REJECTED: 'bg-red-100 text-red-600',
  FAILED: 'bg-red-100 text-red-600',
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
};

const PAST_STATUS_TILE: Record<string, string> = {
  DELIVERED: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600',
  REJECTED: 'bg-red-50 text-red-600',
  FAILED: 'bg-red-50 text-red-600',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-700',
  ASSIGNED: 'bg-blue-50 text-blue-700',
  IN_TRANSIT: 'bg-blue-50 text-blue-700',
};

type PastOrderCardProps = {
  order: Order;
  disabled: boolean;
  adding: boolean;
  onReorder: () => void;
  onDetails: () => void;
};

export default function PastOrderCard({ order, disabled, adding, onReorder, onDetails }: PastOrderCardProps) {
  const date = formatOrderDate(order);
  const status = orderStatusKey(order.orderStatus);

  return (
    <div
      className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-white p-4 shadow-sm"
    >
      {order.items?.[0]?.imageUrls?.[0] ? (
        <img
          src={order.items[0].imageUrls[0]}
          alt={order.items[0].itemName ?? 'Order item'}
          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${PAST_STATUS_TILE[status] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {order.items?.[0]?.itemName?.slice(0, 12) ?? 'Order'}
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${PAST_STATUS_PILL[status] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {orderStatusLabel(status)}
        </span>
        {date && (
          <p className="mt-2 text-sm text-ink-soft">{date}</p>
        )}
        <p className="text-base font-semibold text-ink">
          {order.orderNumber} ·{' '}
          {order.totalQuantityOfItems}{' '}
          {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
        </p>
        <p className="mt-1 text-lg font-bold text-ink">
          {formatNaira(order.totalPrice)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onReorder}
          className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {adding ? 'Adding...' : 'Re-order'}
        </button>
        <button
          type="button"
          onClick={onDetails}
          className="rounded-full border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5"
        >
          Details
        </button>
      </div>
    </div>
  );
}
