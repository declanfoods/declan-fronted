import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Minus, Plus, Trash2, RotateCcw, LogIn } from 'lucide-react';
import AppLayout from '../../app/AppLayout';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';
import {
  reorderCartApi,
  reorderItemPrice,
  type ReorderCart as ReorderCartType,
} from '../../../app/lib/reorderCartApi';
import { orderApi } from '../../../app/lib/orderApi';
import { paymentApi, type PaymentMethod } from '../../../app/lib/paymentApi';
import { addressApi, type DeliveryAddress } from '../../../app/lib/addressApi';
import { isAuthenticated } from '../../../app/lib/auth';
import { useToast } from '../../ui/Toast';

/*
|==========================================================================
| REORDER CART  —  /app/reorder-cart
|==========================================================================
|
| WHY THIS SCREEN EXISTS
|
| "Re-order doesn't work" had a specific cause, and it wasn't the button.
|
|   POST /api/v1/orders/:orderId/readd   → "Order items added to reorder cart"
|   GET  /api/v1/cart                    → the MAIN cart
|
| `handleReadd` in Orders.tsx called the right endpoint, then navigated to
| /app/cart — which reads the main cart. The readd succeeded every time; the
| items landed in the reorder cart and the customer was shown an empty main
| cart. Silent `catch {}` on top of that meant any real failure was invisible
| too.
|
| The backend has a full reorder-cart API (GET / PATCH / DELETE on
| /api/v1/reorder-carts) and, until now, nothing in the UI called it.
| This is that screen: view the cart, adjust quantities, drop items, then
| place the order via POST /api/v1/orders/reorder.
|
| NOTE ON CHECKOUT: /orders/reorder takes its items from the reorder cart
| server-side, so the body carries only payment + address + instructions —
| no line items. That's why this page has its own compact checkout step
| instead of reusing the main Checkout screen, which builds from the main
| cart.
*/

export default function ReorderCart() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cart, setCart] = useState<ReorderCartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  const authenticated = isAuthenticated();

  // ---------------------------------------------------------------------
  // Load: reorder cart + the two things checkout needs.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);

      const [cartRes, payRes, addrRes] = await Promise.allSettled([
        reorderCartApi.getReorderCart(),
        paymentApi.getPaymentMethods(),
        addressApi.getAddresses(),
      ]);

      if (!alive) return;

      if (cartRes.status === 'fulfilled') {
        setCart(cartRes.value.data.data.cart);
        setError('');
      } else {
        const err = cartRes.reason;
        setError(
          err?.response?.data?.message ?? 'Could not load your reorder cart.'
        );
      }

      if (payRes.status === 'fulfilled') {
        // NOTE: the API's field name really is `paymentMethodds` — extra "d",
        // a backend typo. Do not "fix" it here: the client has to match what
        // is actually sent.
        const methods = payRes.value.data.data.paymentMethodds ?? [];
        setPaymentMethods(methods);
        if (methods.length === 1) setSelectedPayment(methods[0].id);
      }

      if (addrRes.status === 'fulfilled') {
        const saved = addrRes.value.data.data.deliveryAddresses ?? [];
        setAddresses(saved);
        if (saved.length > 0) setSelectedAddressId(saved[0].id);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [authenticated]);

  // ---------------------------------------------------------------------
  // Quantity. The API takes a delta + direction, not an absolute value.
  // ---------------------------------------------------------------------
  const changeQty = async (
    itemId: string,
    current: number,
    delta: 1 | -1
  ) => {
    // Guard the bottom end here: sending DECREMENT at 1 is a 400.
    if (delta === -1 && current <= 1) return;

    setBusyItemId(itemId);
    try {
      const res = await reorderCartApi.updateReorderItem(itemId, {
        quantity: 1,
        operationType: delta === 1 ? 'INCREMENT' : 'DECREMENT',
      });
      setCart(res.data.data.cart);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? 'Could not update that item.',
        'error'
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setBusyItemId(itemId);
    try {
      const res = await reorderCartApi.removeReorderItem(itemId);
      setCart(res.data.data.cart);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? 'Could not remove that item.',
        'error'
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // ---------------------------------------------------------------------
  // Place the order. No items in the body — the server reads its own cart.
  // ---------------------------------------------------------------------
  const handleReorder = async () => {
    if (!selectedPayment) {
      showToast('Please select a payment method.', 'error');
      return;
    }
    if (!selectedAddressId) {
      showToast('Please select a delivery address.', 'error');
      return;
    }

    setPlacing(true);
    try {
      const res = await orderApi.reorder({
        payment: { paymentMethodId: selectedPayment },
        deliveryInstructions: instructions || undefined,
        deliveryAddressId: selectedAddressId,
      });

      const order = (res.data as any)?.data?.order;
      showToast('Order placed from your reorder cart.', 'success');

      navigate(
        order?.id ? `/app/orders/${order.id}/tracking` : '/app/orders'
      );
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ??
          'Could not place the order. Please try again.',
        'error'
      );
    } finally {
      setPlacing(false);
    }
  };

  // ---------------------------------------------------------------------
  // Not signed in
  // ---------------------------------------------------------------------
  if (!authenticated) {
    return (
      <AppLayout title="Reorder Cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <LogIn size={40} className="text-primary" />
          <p className="text-lg font-semibold text-ink">
            Login to view your reorder cart
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Go to Login
          </button>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Reorder Cart">
        <SplashLoader />
      </AppLayout>
    );
  }

  // ---------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------
  if (error) {
    return (
      <AppLayout title="Reorder Cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-base font-semibold text-ink">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </AppLayout>
    );
  }

  const items = cart?.cartItems ?? [];

  // ---------------------------------------------------------------------
  // Empty
  // ---------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <AppLayout title="Reorder Cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <RotateCcw size={40} className="text-primary" />
          <p className="text-lg font-semibold text-ink">
            Your reorder cart is empty
          </p>
          <p className="max-w-xs text-sm text-ink-soft">
            Tap <span className="font-semibold">Re-order</span> on any past
            order and its items will land here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/app/orders')}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            View My Orders
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reorder Cart">
      <div className="space-y-6 px-4 pb-40 pt-2">
        <div className="rounded-2xl bg-primary/10 px-4 py-3">
          <p className="text-sm text-ink-soft">
            These are the items from your past order. Adjust anything, then
            place the order below.
          </p>
        </div>

        {/* ============================ ITEMS ============================ */}
        <section className="space-y-3">
          {items.map((item) => {
            const image = item.itemUrls?.[0] ?? null;
            const price = reorderItemPrice(item);
            const busy = busyItemId === item.id;

            return (
              <div
                key={item.id}
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
                      disabled={busy || item.quantity <= 1}
                      onClick={() => changeQty(item.id, item.quantity, -1)}
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
                      disabled={busy}
                      onClick={() => changeQty(item.id, item.quantity, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink disabled:opacity-40"
                      aria-label={`Increase quantity of ${item.itemName}`}
                    >
                      <Plus size={14} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeItem(item.id)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 disabled:opacity-40"
                      aria-label={`Remove ${item.itemName}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ====================== PAYMENT METHOD ====================== */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">💳 Payment Method</h3>

          {paymentMethods.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              No payment methods available on your account.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {paymentMethods.map((pm) => {
                const selected = pm.id === selectedPayment;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {pm.title}
                      </span>
                      {pm.description && (
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {pm.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================== DELIVERY ADDRESS ====================== */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">📍 Delivery Address</h3>

          {addresses.length === 0 ? (
            <div className="mt-3">
              <p className="text-sm text-ink-soft">
                No saved address. Add one before placing this order.
              </p>
              <button
                type="button"
                onClick={() => navigate('/app/profile')}
                className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {addresses.map((a) => {
                const selected = a.id === selectedAddressId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAddressId(a.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {a.state}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">
                        {a.addressLine}
                        {a.country ? `, ${a.country}` : ''}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================== INSTRUCTIONS ====================== */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">📝 Instructions</h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="e.g. Call me when you reach the gate"
            className="mt-3 w-full resize-none rounded-2xl border border-gray-200 p-3 text-sm text-ink outline-none focus:border-primary"
          />
        </section>
      </div>

      {/* ====================== STICKY TOTAL BAR ====================== */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-soft">
              {cart?.itemCount ?? 0} item
              {(cart?.itemCount ?? 0) === 1 ? '' : 's'}
            </p>
            <p className="text-lg font-bold text-ink">
              {formatNaira(cart?.subTotal ?? 0)}
            </p>
          </div>

          <button
            type="button"
            disabled={placing || addresses.length === 0 || paymentMethods.length === 0}
            onClick={handleReorder}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {placing && <Loader2 size={16} className="animate-spin" />}
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}