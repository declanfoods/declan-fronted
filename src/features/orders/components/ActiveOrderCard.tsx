import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { Order } from '../api/orderApi';
import { isOrderDelivered, orderProgress, orderStatusKey, orderStatusLabel } from '../orderPresentation';

export default function ActiveOrderCard({ order, onTrack }: { order: Order; onTrack: () => void }) {
  const timeline = order.orderTimeline ?? [];
  const status = orderStatusKey(order.orderStatus);

  return (
    <div className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      {/* Order number + totals */}
      <div className="flex items-start justify-between">
        <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
          {order.orderNumber}
        </span>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink-soft">
            {formatNaira(order.totalPrice)}
          </p>
          <p className="text-xs text-ink-soft">
            {order.totalQuantityOfItems}{' '}
            {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Timeline progress */}
      {timeline.length > 0 ? (
        <div className="mt-8">
          <div
            className="grid gap-1 text-center text-[10px] font-semibold sm:text-xs"
            style={{
              gridTemplateColumns: `repeat(${timeline.length}, 1fr)`,
            }}
          >
            {timeline.map((event, i) => (
              <div
                key={i}
                className={
                  event.passed ? 'text-primary' : 'text-ink-soft'
                }
              >
                {event.label}
              </div>
            ))}
          </div>

          <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${orderProgress(timeline)}%`,
              }}
            />
          </div>
        </div>
      ) : (
        /* Fallback static bar for PENDING with null timeline */
        <div className="mt-8">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold sm:text-xs">
            {['Order Placed', 'Processing', 'Picked Up', 'In Transit', 'Delivered'].map(
              (stage, i) => (
                <div
                  key={stage}
                  className={i === 0 ? 'text-primary' : 'text-ink-soft'}
                >
                  {stage}
                </div>
              )
            )}
          </div>
          <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary"
              style={{ width: '10%' }}
            />
          </div>
        </div>
      )}

      {/* Status + actions */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className={
            'rounded-full px-3 py-1 text-xs font-semibold ' +
            (status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700'
              : isOrderDelivered(status)
                ? 'bg-green-100 text-green-700'
                : 'bg-primary/10 text-primary')
          }
        >
          {orderStatusLabel(status)}
        </span>
        <button
          type="button"
          onClick={onTrack}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Track Live ❯
        </button>
      </div>
    </div>
  );
}
