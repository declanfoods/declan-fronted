import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiProduct } from '../../app/lib/productApi';
import { cartApi } from '../../app/lib/cartApi';
import { formatNaira } from '../data/products';





interface ProductCardProps {
  product: ApiProduct;
  onCartUpdate?: () => void;
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.imageUrls?.[0] ?? '';
  const categoryName = product.category?.name ?? 'Product';
  const price = Number(product.price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 });
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
    <Link
      to={`/app/shop/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-4xl">
          🛒
        </div>
      )}

      <div className="p-4">
        <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
          {categoryName}
        </span>

        <h3 className="mt-2 text-base font-semibold text-ink capitalize">
          {product.name}
        </h3>

        {product.scale && (
          <p className="mt-0.5 text-xs text-ink-soft capitalize">
            per {product.scale}
          </p>
        )}

        <p className="mt-2 text-lg font-bold text-ink">
          {formatNaira(price)}
        </p>

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
    </Link>
  );
}