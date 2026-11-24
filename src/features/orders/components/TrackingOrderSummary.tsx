import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { Order } from '../api/orderApi';

type TrackingOrderSummaryProps = {
  order: Order;
  mode: 'account' | 'guest';
  transferCharge: number;
  totalWithCharge: number;
};

export default function TrackingOrderSummary({
  order,
  mode,
  transferCharge,
  totalWithCharge,
}: TrackingOrderSummaryProps) {
  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold text-ink">Order Summary</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {order.orderNumber}
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-4">
        {(order.items ?? []).map((item) => {
          const imageUrl = item.imageUrls?.[0] ?? '';
          return (
            <li
              key={item.id}
              className="flex items-center gap-4 border-b border-muted/60 pb-4 last:border-0 last:pb-0"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.itemName}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {item.itemType === 'FOODPACK' ? '🎒' : '📦'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-base font-semibold capitalize text-ink">
                    {item.itemName}
                  </p>
                  {mode === 'account' && item.acceptPaymentOnDelivery === false && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Pay before delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft">
                  Qty: {item.quantity} × {formatNaira(Number(item.unitPrice))}
                </p>
              </div>
              <p className="text-lg font-bold text-ink">
                {formatNaira(Number(item.unitPrice) * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      {mode === 'account' ? (
        <div className="mt-5 space-y-2 border-t border-muted/60 pt-5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Items subtotal</span>
            <span>{formatNaira(order.priceOfItems)}</span>
          </div>
          {order.deliveryPrice > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Delivery fee</span>
              <span>{formatNaira(order.deliveryPrice)}</span>
            </div>
          )}
          {transferCharge > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Transfer charge</span>
              <span>{formatNaira(transferCharge)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-muted/60 pt-3 text-base font-bold text-ink">
            <span>Total to pay</span>
            <span>{formatNaira(totalWithCharge)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between border-t border-muted/60 pt-5">
          <span className="text-lg font-semibold text-ink">Total</span>
          <span className="text-xl font-extrabold text-ink">
            {formatNaira(order.totalPrice)}
          </span>
        </div>
      )}
    </section>
  );
}
