import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2 } from 'lucide-react';
import AppLayout from '../../app/AppLayout';
import SplashLoader from '../../ui/SplashLoader';
import Button from '../../ui/Button';
import { formatNaira } from '../../data/products';
import { cartApi, type Cart as CartType, type CartItem } from '../../../app/lib/cartApi';
import { guestCart } from '../../../app/lib/guestCart';
import { isAuthenticated } from '../../../app/lib/auth';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated()) {
      setCart(guestCart.toCart());
      setLoading(false);
      return;
    }
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data.cart);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    if (!isAuthenticated()) {
      return guestCart.onChange(fetchCart);
    }
  }, []);

  const markUpdating = (id: string, active: boolean) => {
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      active ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleUpdateQty = async (item: CartItem, delta: number) => {
    markUpdating(item.id, true);
    if (!isAuthenticated()) {
      guestCart.setQty(item.id, item.quantity + delta);
      await fetchCart();
      markUpdating(item.id, false);
      return;
    }
    try {
      await cartApi.updateItemQty(item.id, {
        quantity: 1,
        operationType: delta > 0 ? 'INCREMENT' : 'DECREMENT',
      });
      await fetchCart();
    } catch {}
    finally {
      markUpdating(item.id, false);
    }
  };

  const handleRemove = async (itemId: string) => {
    markUpdating(itemId, true);
    if (!isAuthenticated()) {
      guestCart.removeItem(itemId);
      await fetchCart();
      markUpdating(itemId, false);
      return;
    }
    try {
      await cartApi.removeItem(itemId);
      await fetchCart();
    } catch {}
    finally {
      markUpdating(itemId, false);
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    if (!isAuthenticated()) {
      guestCart.clear();
      await fetchCart();
      setClearing(false);
      return;
    }
    try {
      await cartApi.clearCart();
      await fetchCart();
    } catch {}
    finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Cart">
        <SplashLoader />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  const items = cart?.cartItems ?? [];
  const isEmpty = items.length === 0;

  return (
    <AppLayout title="My Cart">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-40 h-24 w-24 rounded-full bg-blob-tan"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-6 bottom-40 h-20 w-20 rounded-full bg-primary/20"
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Your Order</h2>
            <p className="text-sm text-ink-soft">
              {cart?.itemCount ?? 0}{' '}
              {(cart?.itemCount ?? 0) === 1 ? 'item' : 'items'} from Declan Foods
            </p>
          </div>
          {!isEmpty && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleClearCart}
              className="text-sm font-semibold text-red-500 hover:underline disabled:opacity-60"
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="mt-12 text-center">
            <p className="text-5xl">🛒</p>
            <p className="mt-4 text-lg font-semibold text-ink-soft">
              Your cart is empty
            </p>
            <button
              onClick={() => navigate('/app/shop')}
              className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const imageUrl = item.itemUrls?.[0] ?? '';
                const itemTotal = Number(item.itemPrice) * item.quantity;
                const isUpdating = updatingItems.has(item.id);

                return (
                  <div
                    key={item.id}
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

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-soft capitalize">
                        {item.itemCategoryName}
                      </p>
                      <p className="text-base font-semibold text-ink capitalize truncate">
                        {item.itemName}
                      </p>
                      <p className="mt-1 text-lg font-bold text-ink">
                        {formatNaira(itemTotal)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {formatNaira(Number(item.itemPrice))} each
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() => handleUpdateQty(item, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-base font-semibold text-ink">
                          {isUpdating ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-primary"
                            />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateQty(item, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleRemove(item.id)}
                        className="text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-8 border-t border-muted" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-ink">Subtotal</span>
                <span className="text-lg font-bold text-ink">
                  {formatNaira(cart?.subTotal ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-ink">Total Payment</span>
                <span className="text-2xl font-extrabold text-ink">
                  {formatNaira(cart?.subTotal ?? 0)}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate('/app/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}