import { Truck } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { CartItem } from '../../cart/api/cartApi';
import { getCartLinePricing } from '../../cart/pricing';
import type { CheckoutTotals } from '../totals';

export default function CheckoutSummary({ items, totals }: { items: CartItem[]; totals: CheckoutTotals }) {
  const { subtotal, remainingForFreeDelivery, deliveryFee, transferCharge, total } = totals;
  const freeDelivery = deliveryFee === 0;

  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-ink">Order Summary</h3>

      <ul className="mt-5 flex flex-col gap-4">
        {items.map((item) => {
          const imageUrl = item.itemUrls?.[0] ?? '';
          const itemTotal = Number(item.itemPrice) * item.quantity;
          const pricing = getCartLinePricing(item);

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
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold capitalize text-ink">
                  {item.itemName}
                </p>
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="text-xs text-ink-soft">
                    Qty: {item.quantity} × {formatNaira(pricing.price)}
                  </span>
                  {pricing.isDiscounted && (
                    <>
                      <span className="text-xs text-ink-soft line-through">
                        {formatNaira(pricing.originalPrice)}
                      </span>
                      {pricing.percentOff > 0 && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                          {pricing.percentOff}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-lg font-bold text-ink">{formatNaira(itemTotal)}</p>
            </li>
          );
        })}
      </ul>

      {/* Subtotal / Delivery / Total breakdown */}
      <div className="mt-5 space-y-2 border-t border-muted/60 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-ink-soft">Subtotal</span>
          <span className="font-medium text-ink">{formatNaira(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <Truck size={14} />
            Delivery fee
          </span>
          {freeDelivery ? (
            <span className="font-semibold text-primary">Free</span>
          ) : (
            <span className="font-medium text-ink">{formatNaira(deliveryFee)}</span>
          )}
        </div>

        {transferCharge > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Transfer charge</span>
            <span className="font-medium text-amber-700">{formatNaira(transferCharge)}</span>
          </div>
        )}

        {/* Nudge banner — only shown when fee applies */}
        {!freeDelivery && (
          <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Add{' '}
            <span className="font-semibold">
              {formatNaira(remainingForFreeDelivery)}
            </span>{' '}
            more to your order to get free delivery.
          </div>
        )}

        {freeDelivery && (
          <div className="rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary">
            🎉 You qualify for free delivery!
          </div>
        )}

        <div className="flex items-center justify-between border-t border-muted/60 pt-3 text-base font-bold">
          <span className="text-ink">Total</span>
          <span className="text-ink">{formatNaira(total)}</span>
        </div>
      </div>
    </section>
  );
}
