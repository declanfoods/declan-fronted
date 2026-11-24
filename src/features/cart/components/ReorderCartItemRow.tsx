import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { reorderItemImage, reorderItemPrice, type ReorderCartItem } from '../api/reorderCartApi';

type ReorderCartItemRowProps = {
  item: ReorderCartItem;
  disabled: boolean;
  busy: boolean;
  onQuantityChange: (delta: 1 | -1) => void;
  onRemove: () => void;
};

export default function ReorderCartItemRow({
  item,
  disabled,
  busy,
  onQuantityChange,
  onRemove,
}: ReorderCartItemRowProps) {
  const image = reorderItemImage(item);
  const price = reorderItemPrice(item);

  return (
    <div
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"
    >
      {image ? (
        <img
          src={image}
          alt={item.itemName}
          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-500">
          No image
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {item.itemName}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-soft">
          {item.itemCategoryName}
        </p>
        <p className="mt-1 text-sm font-bold text-primary">
          {formatNaira(price)}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || item.quantity <= 1}
            onClick={() => onQuantityChange(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink disabled:opacity-40"
            aria-label={`Reduce quantity of ${item.itemName}`}
          >
            <Minus size={14} />
          </button>

          <span className="min-w-[2rem] text-center text-sm font-semibold text-ink">
            {busy ? (
              <Loader2 size={14} className="mx-auto animate-spin" />
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onQuantityChange(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink disabled:opacity-40"
            aria-label={`Increase quantity of ${item.itemName}`}
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 disabled:opacity-40"
            aria-label={`Remove ${item.itemName}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
