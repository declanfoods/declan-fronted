import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import type { ApiFoodpack } from '../../app/lib/foodpackApi';
import { cartApi } from '../../app/lib/cartApi';
import { formatNaira } from '../data/products';



interface FoodPackCardProps {
  pack: ApiFoodpack;
  onCartUpdate?: () => void;
}

export default function FoodPackCard({ pack, onCartUpdate }: FoodPackCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = pack.imageUrls?.[0] ?? '';
  const price = Number(pack.price);
  const hasDiscount = pack.amountOff > 0;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await cartApi.addItem({ foodpackId: pack.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-muted bg-white shadow-sm">
      {imageUrl ? (
        <img src={imageUrl} alt={pack.name} className="h-32 w-full object-cover" />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-3xl">
          🎒
        </div>
      )}

      <div className="p-3">
        <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
          {pack.category?.name ?? 'Food Pack'}
        </span>

        <div className="mt-2 rounded-xl border border-primary px-3 py-2">
          {pack.items.slice(0, 4).map((item) => (
            <p
              key={item.id}
              className="text-sm font-semibold leading-tight text-primary capitalize"
            >
              {item.name}{' '}
              <span className="text-xs font-normal text-ink-soft">
                ×{item.quantityOfProductInPack} {item.quantityUnit}
              </span>
            </p>
          ))}
          {pack.items.length > 4 && (
            <p className="mt-0.5 text-xs font-medium text-accent">
              +{pack.items.length - 4} more
            </p>
          )}
        </div>

        {hasDiscount && (
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
              {pack.amounOffInPercent}% OFF
            </span>
            <span className="text-xs text-ink-soft line-through">
              {formatNaira(pack.originalPrice)}
            </span>
          </div>
        )}

        <p className="mt-1 text-sm font-semibold text-ink capitalize">{pack.name}</p>
        <p className="mt-1 text-base font-bold text-ink">{formatNaira(price)}</p>

        <button
          type="button"
          disabled={adding}
          onClick={handleAddToCart}
          className={
            'mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ' +
            (added
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-60')
          }
        >
          {adding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShoppingCart size={16} strokeWidth={2} />
          )}
          {adding ? 'Adding...' : added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}