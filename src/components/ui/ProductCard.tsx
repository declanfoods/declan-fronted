import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiProduct } from '../../app/lib/productApi';
import { cartApi } from '../../app/lib/cartApi';
import { guestCart } from '../../app/lib/guestCart';
import { isAuthenticated } from '../../app/lib/auth';
import { formatNaira } from '../data/products';
import { getEffectivePrice } from '../../app/lib/productPricing';
import { useCart } from '../../app/lib/CartContext';

interface ProductCardProps {
  product: ApiProduct;
  onCartUpdate?: () => void;
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { refreshCartCount } = useCart();

  const imageUrl    = product.imageUrls?.[0] ?? '';
  const categoryName = product.category?.name ?? 'Product';
  const pricing     = getEffectivePrice(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    try {
      if (isAuthenticated()) {
        await cartApi.addItem({ productId: product.id, quantity: 1 });
      } else {
        guestCart.addItem({
          id:               product.id,
          itemName:         product.name,
          itemCategoryName: categoryName,
          itemId:           product.id,
          itemType:         'PRODUCT',
          itemUrls:         product.imageUrls ?? [],
          itemPrice:        String(pricing.price),
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      await refreshCartCount();
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/app/shop/${product.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Product image */}
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-4xl">
          🛒
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {/* Category + discount badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
            {categoryName}
          </span>
          {pricing.isDiscounted && pricing.percentOff > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
              {pricing.percentOff}% OFF
            </span>
          )}
        </div>

        {/* Pay-before-delivery notice */}
        {product.acceptPaymentOnDelivery === false && (
          <span className="mt-2 self-start rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            💳 Pay before delivery
          </span>
        )}

        <h3 className="mt-2 text-base font-semibold capitalize text-ink">
          {product.name}
        </h3>

        {product.scale && (
          <p className="mt-0.5 text-xs capitalize text-ink-soft">per {product.scale}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-ink">{formatNaira(pricing.price)}</p>
          {pricing.isDiscounted && (
            <p className="text-sm font-medium text-ink-soft line-through">
              {formatNaira(pricing.originalPrice)}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={adding}
          onClick={handleAddToCart}
          className={
            'mt-auto flex w-full items-center justify-center gap-2 rounded-full pt-3 py-2.5 text-sm font-semibold transition-colors ' +
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
    </Link>
  );
}