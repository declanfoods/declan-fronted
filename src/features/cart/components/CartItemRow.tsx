import { Loader2, Trash2 } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { CartItem } from '../api/cartApi';
import { getCartLinePricing } from '../pricing';

type CartItemRowProps = {
  item: CartItem;
  disabled: boolean;
  isUpdating: boolean;
  onQuantityChange: (delta: 1 | -1) => void;
  onRemove: () => void;
};

export default function CartItemRow({
  item,
  disabled,
  isUpdating,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const imageUrl = item.itemUrls?.[0] ?? '';
  const itemTotal = Number(item.itemPrice) * item.quantity;
  const pricing = getCartLinePricing(item);
  const discountBadge = item.discount?.discountType?.includes('fixed')
    ? `#${pricing.percentOff} OFF`
    : `${pricing.percentOff}% OFF`;

  return (
    <div
      className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-white p-4 shadow-sm"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.itemName}
          className="h-20 w-20 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-3xl">
          {item.itemType === 'FOODPACK' ? '🎒' : '🛒'}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium capitalize text-ink-soft">
          {item.itemCategoryName}
        </p>
        <p className="truncate text-base font-semibold capitalize text-ink">
          {item.itemName}
        </p>

        {/* Pay-before-delivery badge */}
        {item.acceptPaymentOnDelivery === false && (
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            💳 Pay before delivery
          </span>
        )}

        <p className="mt-1 text-lg font-bold text-ink">
          {formatNaira(itemTotal)}
        </p>

        {pricing.isDiscounted ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs text-ink-soft">
              {formatNaira(pricing.price)} each
            </span>
            <span className="text-xs text-ink-soft line-through">
              {formatNaira(pricing.originalPrice)}
            </span>
            {pricing.percentOff > 0 && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                {discountBadge}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-ink-soft">
            {formatNaira(pricing.price)} each
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || item.quantity <= 1}
            onClick={() => onQuantityChange(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[1.5rem] text-center text-base font-semibold text-ink">
            {isUpdating ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              item.quantity
            )}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onQuantityChange(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
