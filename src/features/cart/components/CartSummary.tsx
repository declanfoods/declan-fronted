import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { CartItem } from '../api/cartApi';
import { getCartLinePricing, getTransferCharge } from '../pricing';

export default function CartSummary({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const hasPayBeforeDeliveryItem = items.some((item) => item.acceptPaymentOnDelivery === false);
  const transferCharge = hasPayBeforeDeliveryItem ? getTransferCharge(subtotal) : 0;
  const totalToPay = subtotal + transferCharge;
  const savings = items.reduce(
    (sum, item) => sum + getCartLinePricing(item).discountAmount * item.quantity,
    0,
  );

  return (
    <>
      {savings > 0 && (
        <>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-accent/10 px-4 py-3">
            <span className="text-sm font-semibold text-accent">Discount savings</span>
            <span className="text-base font-extrabold text-accent">−{formatNaira(savings)}</span>
          </div>
          <div className="my-8 border-t border-muted" />
        </>
      )}

      {/* Totals */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-ink">Subtotal</span>
          <span className="text-lg font-bold text-ink">{formatNaira(subtotal)}</span>
        </div>

        {/* Transfer charge line — only when cart has a pay-before-delivery item */}
        {hasPayBeforeDeliveryItem && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700">Transfer charge</span>
            <span className="text-sm font-bold text-amber-700">
              +{formatNaira(transferCharge)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-ink">Total Payment</span>
          <span className="text-2xl font-extrabold text-ink">
            {formatNaira(totalToPay)}
          </span>
        </div>
      </div>

      {/* Pay-before-delivery cart notice */}
      {hasPayBeforeDeliveryItem && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">
            💳 Payment required before processing
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-700">
            Your cart contains item(s) that must be paid for upfront. After checkout,
            transfer{' '}
            <span className="font-bold">{formatNaira(totalToPay)}</span> and send proof
            of payment to our WhatsApp. Your order will be cancelled after 48 hours if
            payment is not received.
          </p>
        </div>
      )}
    </>
  );
}
