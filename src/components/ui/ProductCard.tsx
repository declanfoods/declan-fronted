import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiProduct } from '../../app/lib/productApi';
import { cartApi } from '../../app/lib/cartApi';
import { guestCart } from '../../app/lib/guestCart';
import { isAuthenticated } from '../../app/lib/auth';
import { formatNaira } from '../data/products';
import { getEffectivePrice } from '../../app/lib/productPricing';

interface ProductCardProps {
  product: ApiProduct;
  onCartUpdate?: () => void;
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.imageUrls?.[0] ?? '';
  const categoryName = product.category?.name ?? 'Product';

  /*
    `product.price` is the price BEFORE any discount, so this card used to show
    70 naira for an item the customer pays 50 for. getEffectivePrice() resolves
    the discount object the API has always sent. See productPricing.ts.
  */
  const pricing = getEffectivePrice(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      if (isAuthenticated()) {
        await cartApi.addItem({ productId: product.id, quantity: 1 });
      } else {
        guestCart.addItem({
          id: product.id,
          itemName: product.name,
          itemCategoryName: categoryName,
          itemId: product.id,
          itemType: 'PRODUCT',
          itemUrls: product.imageUrls ?? [],
          /*
            The DISCOUNTED price. The guest cart is the source of truth for what
            this line costs, and Checkout prices straight off itemPrice — so
            storing product.price here would show 50 on the card and charge 70
            at checkout.
          */
          itemPrice: String(pricing.price),
        });
      }
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
    // <Link
    //   to={`/app/shop/${product.id}`}
    //   className="block overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-shadow hover:shadow-md"
    // >
    //   {imageUrl ? (
    //     <img
    //       src={imageUrl}
    //       alt={product.name}
    //       className="h-40 w-full object-cover"
    //     />
    //   ) : (
    //     <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-4xl">
    //       🛒
    //     </div>
    //   )}

    //   <div className="p-4">
    //     <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
    //       {categoryName}
    //     </span>

    //     <h3 className="mt-2 text-base font-semibold text-ink capitalize">
    //       {product.name}
    //     </h3>

    //     {product.scale && (
    //       <p className="mt-0.5 text-xs text-ink-soft capitalize">
    //         per {product.scale}
    //       </p>
    //     )}

    //     {/*
    //       Discounted price leads, original is struck through beside it. Same
    //       treatment FoodPackCard already uses for its discounts, so products
    //       and food packs finally read the same way on the shop grid.
    //     */}
    //     <div className="mt-2 flex flex-wrap items-center gap-2">
    //       <p className="text-lg font-bold text-ink">{formatNaira(pricing.price)}</p>

    //       {pricing.isDiscounted && (
    //         <>
    //           <p className="text-sm font-medium text-ink-soft line-through">
    //             {formatNaira(pricing.originalPrice)}
    //           </p>
    //           {pricing.percentOff > 0 && (
    //             <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
    //               {pricing.percentOff}% OFF
    //             </span>
    //           )}
    //         </>
    //       )}
    //     </div>

    //     <button
    //       type="button"
    //       disabled={adding}
    //       onClick={handleAddToCart}
    //       className={
    //         'mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ' +
    //         (added
    //           ? 'bg-green-500 text-white'
    //           : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-60')
    //       }
    //     >
    //       {adding ? (
    //         <Loader2 size={16} className="animate-spin" />
    //       ) : (
    //         <ShoppingCart size={16} strokeWidth={2} />
    //       )}
    //       {adding ? 'Adding...' : added ? 'Added ✓' : 'Add to Cart'}
    //     </button>
    //   </div>
    // </Link>
    <Link
      to={`/app/shop/${product.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-shadow hover:shadow-md"

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

    <div className="flex flex-1 flex-col p-4">

  <span className="self-start rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
    {categoryName}
  </span>

  {pricing.isDiscounted && pricing.percentOff > 0 && (
    <span className="mt-2 self-start rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
      {pricing.percentOff}% OFF
    </span>
  )}

  <h3 className="mt-2 text-base font-semibold text-ink capitalize">
    {product.name}
  </h3>

  {product.scale && (
    <p className="mt-0.5 text-xs text-ink-soft capitalize">
      per {product.scale}
    </p>
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
      'mt-auto pt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ' +
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