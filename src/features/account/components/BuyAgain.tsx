import { ShoppingCart } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { useToast } from '../../../shared/ui/Toast';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import type { ApiProduct } from '../../catalogue/api/productApi';
import { getEffectivePrice } from '../../catalogue/pricing';
import { addProductToCart } from '../../cart/cartActions';

export default function BuyAgain({ products }: { products: ApiProduct[] }) {
  const { showToast } = useToast();

  const addToCart = async (product: ApiProduct) => {
    try {
      await addProductToCart(product);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not add the product to your cart.'), 'error');
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-ink lg:mb-5 lg:text-2xl lg:font-extrabold lg:tracking-tight lg:text-[#153526]">Buy Again!</h2>
      <div className="lg:grid lg:grid-cols-3 lg:gap-5">
        {products.slice(0, 3).map((product) => {
          const pricing = getEffectivePrice(product);
          const thumbnail = product.imageUrls?.[0];
          return (
            <div key={product.id} className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-muted bg-white p-3 shadow-sm lg:mb-0 lg:border-[#e3e9df] lg:p-4">
              <div className="flex min-w-0 items-center gap-3">
                {thumbnail ? (
                  <img src={thumbnail} alt={product.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">📦</span>
                )}
                <div>
                  <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                    {product.category?.name ?? 'Product'}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-primary">{product.name}</p>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-sm font-bold text-ink">{formatNaira(pricing.price)}</p>
                    {pricing.isDiscounted && (
                      <p className="text-xs font-medium text-ink-soft line-through">{formatNaira(pricing.originalPrice)}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Add ${product.name} to cart`}
                onClick={() => addToCart(product)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark lg:bg-[#245b38] lg:hover:bg-[#153526]"
              >
                <ShoppingCart size={18} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
