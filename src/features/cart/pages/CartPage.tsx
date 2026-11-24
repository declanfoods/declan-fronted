import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import Button from '../../../components/ui/Button';
import SplashLoader from '../../../components/ui/SplashLoader';
import CartItemRow from '../components/CartItemRow';
import CartSummary from '../components/CartSummary';
import { useMainCart } from '../useMainCart';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    retry,
    pendingItem,
    clearing,
    actionError,
    updateQuantity,
    removeItem,
    clearCart,
  } = useMainCart();

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
            type="button"
            onClick={() => void retry()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  const items = cart?.cartItems ?? [];
  const itemCount = cart?.itemCount ?? 0;
  const isEmpty = items.length === 0;
  const busy = pendingItem !== null || clearing;

  return (
    <AppLayout title="My Cart">
      <div aria-hidden className="pointer-events-none absolute -right-10 top-40 h-24 w-24 rounded-full bg-blob-tan" />
      <div aria-hidden className="pointer-events-none absolute -left-6 bottom-40 h-20 w-20 rounded-full bg-primary/20" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Your Order</h2>
            <p className="text-sm text-ink-soft">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} from Declan Foods
            </p>
          </div>
          {!isEmpty && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void clearCart()}
              className="text-sm font-semibold text-red-500 hover:underline disabled:opacity-60"
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>

        {actionError && (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </p>
        )}

        {isEmpty ? (
          <div className="mt-12 text-center">
            <p className="text-5xl">🛒</p>
            <p className="mt-4 text-lg font-semibold text-ink-soft">Your cart is empty</p>
            <button
              type="button"
              onClick={() => navigate('/app/shop')}
              className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  disabled={busy}
                  isUpdating={pendingItem === item.id}
                  onQuantityChange={(delta) => void updateQuantity(item, delta)}
                  onRemove={() => void removeItem(item.id)}
                />
              ))}
            </div>

            <CartSummary items={items} subtotal={cart?.subTotal ?? 0} />

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full"
                disabled={busy}
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
