import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RotateCcw, LogIn } from 'lucide-react';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import SplashLoader from '../../../components/ui/SplashLoader';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import ReorderCartItemRow from '../components/ReorderCartItemRow';
import { useReorderCart } from '../useReorderCart';
import { orderApi } from '../../orders/api/orderApi';
import { useCheckoutOptions } from '../../checkout/useCheckoutOptions';
import { isAuthenticated } from '../../auth/session';
import { useToast } from '../../../components/ui/Toast';

export default function ReorderCartPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authenticated = isAuthenticated();
  const { cart, loading, error, retry, pendingItem, changeQuantity, remove } = useReorderCart(
    authenticated,
    (message) => showToast(message, 'error'),
  );

  const options = useCheckoutOptions(authenticated, true);
  const { paymentMethods, addresses } = options;
  const [paymentId, setSelectedPayment] = useState('');
  const [addressId, setSelectedAddressId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const selectedPayment = paymentMethods.find((method) => method.id === paymentId)?.id ??
    (paymentMethods.length === 1 ? paymentMethods[0].id : '');
  const selectedAddressId = addresses.find((address) => address.id === addressId)?.id ?? addresses[0]?.id;

  // The server supplies the items from its reorder cart.
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

      const order = res.data?.data?.order;
      showToast('Order placed from your reorder cart.', 'success');

      navigate(
        order?.id ? `/app/orders/${order.id}/tracking` : '/app/orders'
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not place the order. Please try again.'), 'error');
    } finally {
      setPlacing(false);
    }
  };

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

  if (loading || options.loading) {
    return (
      <AppLayout title="Reorder Cart">
        <SplashLoader />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Reorder Cart">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-base font-semibold text-ink">{error}</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </AppLayout>
    );
  }

  const items = cart?.cartItems ?? [];

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
      <div className="space-y-6 px-4 pb-52 pt-2">
        <div className="rounded-2xl bg-primary/10 px-4 py-3">
          <p className="text-sm text-ink-soft">
            These are the items from your past order. Adjust anything, then
            place the order below.
          </p>
        </div>

        {/* ============================ ITEMS ============================ */}
        <section className="space-y-3">
          {items.map((item) => (
            <ReorderCartItemRow
              key={item.id}
              item={item}
              disabled={pendingItem !== null || placing}
              busy={pendingItem === item.id}
              onQuantityChange={(delta) => void changeQuantity(item, delta)}
              onRemove={() => void remove(item.id)}
            />
          ))}
        </section>

        {options.error && (
          <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{options.error}</p>
            <button type="button" onClick={options.retry} className="mt-2 font-semibold underline">
              Try again
            </button>
          </div>
        )}

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
          <div className="fixed inset-x-0 bottom-24 z-30 border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
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
            disabled={placing || pendingItem !== null || addresses.length === 0 || paymentMethods.length === 0}
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
