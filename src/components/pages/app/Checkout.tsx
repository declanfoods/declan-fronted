import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../layout/Container';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';
import { cartApi, type Cart } from '../../../app/lib/cartApi';
import { paymentApi, type PaymentMethod } from '../../../app/lib/paymentApi';
import { userApi, type UserProfile } from '../../../app/lib/userApi';
import { orderApi } from '../../../app/lib/orderApi';
import { guestCart } from '../../../app/lib/guestCart';
import { guestOrderApi } from '../../../app/lib/guestOrderApi';
import { isAuthenticated } from '../../../app/lib/auth';
import { useToast } from '../../ui/Toast';

export default function Checkout() {
  const navigate = useNavigate();
  const guest = !isAuthenticated();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  // Guest-only fields
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddressLine, setGuestAddressLine] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestLandmark, setGuestLandmark] = useState('');

  // Guest verification step (after order is created)
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, payRes, profileRes] = await Promise.allSettled([
          guest ? Promise.resolve(null) : cartApi.getCart(),
          paymentApi.getPaymentMethods(),
          guest ? Promise.resolve(null) : userApi.getProfileOverview(),
        ]);

        if (guest) {
          setCart(guestCart.toCart());
        } else if (cartRes.status === 'fulfilled' && cartRes.value) {
          setCart(cartRes.value.data.data.cart);
        }
        if (payRes.status === 'fulfilled' && payRes.value) {
          // Note: API typo — "paymentMethodds"
          const methods = payRes.value.data.data.paymentMethodds;
          setPaymentMethods(methods);
          if (methods.length > 0) setSelectedPayment(methods[0].id);
        }
        if (!guest && profileRes.status === 'fulfilled' && profileRes.value) {
          setProfile(profileRes.value.data.data);
        }
      } catch {
        setError('Failed to load checkout.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrder = async () => {
    if (guest) {
      if (!guestEmail || !guestName || !guestPhone || !guestAddressLine) {
        showToast('Please fill in your name, email, phone number and delivery address.', 'error');
        return;
      }
      if (!selectedPayment) {
        showToast('Please select a payment method.', 'error');
        return;
      }
      setPlacing(true);
      try {
        const res = await guestOrderApi.createGuestOrder({
          payment: { paymentMethodId: selectedPayment },
          deliveryInstructions: instructions || undefined,
          items: guestCart.getItems(),
          deliveryAddress: {
            addressLine: guestAddressLine,
            state: guestState || undefined,
            landmark: guestLandmark || undefined,
          },
          emailAddress: guestEmail,
          nameOfCustomer: guestName,
          phoneNumber: guestPhone,
        });
        setPlacedOrderNumber(res.data.data.orderNumber);
        guestCart.clear();
      } catch (err: any) {
        showToast(
          err.response?.data?.message ?? 'Failed to place order. Please try again.',
          'error'
        );
      } finally {
        setPlacing(false);
      }
      return;
    }

    if (!selectedPayment) {
      showToast('Please select a payment method.', 'error');
      return;
    }
    setPlacing(true);
    try {
      const res = await orderApi.createOrder({
        payment: { paymentMethodId: selectedPayment },
        deliveryInstructions: instructions || undefined,
      });
      const order = res.data.data.order;
      navigate(`/app/orders/${order.id}/tracking`);
    } catch (err: any) {
      showToast(
        err.response?.data?.message ?? 'Failed to place order. Please try again.',
        'error'
      );
    } finally {
      setPlacing(false);
    }
  };

  const handleVerifyOrder = async () => {
    if (!verifyCode) {
      setVerifyError('Please enter the verification code sent to your email.');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    try {
      await guestOrderApi.verifyGuestOrder({
        customerEmail: guestEmail,
        verificationCode: verifyCode,
        orderNumber: placedOrderNumber,
      });
      setVerified(true);
    } catch (err: any) {
      setVerifyError(err.response?.data?.message ?? 'Invalid or expired code.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <SplashLoader />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Guest order placed — show verification step
  if (guest && placedOrderNumber) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        {verified ? (
          <>
            <CheckCircle2 size={56} className="text-primary" />
            <p className="text-xl font-bold text-ink">Order Confirmed!</p>
            <p className="text-sm text-ink-soft">
              Order <span className="font-semibold text-ink">{placedOrderNumber}</span> is
              being processed. We&apos;ve sent the details to {guestEmail}.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-ink">Verify Your Order</p>
            <p className="max-w-sm text-sm text-ink-soft">
              We sent a verification code to <span className="font-semibold">{guestEmail}</span>{' '}
              for order <span className="font-semibold text-ink">{placedOrderNumber}</span>.
              Enter it below to confirm.
            </p>
            <input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Verification code"
              className="w-full max-w-xs rounded-full border-2 border-primary px-5 py-3 text-center text-sm outline-none"
            />
            {verifyError && (
              <p className="text-sm font-medium text-red-600">{verifyError}</p>
            )}
            <button
              type="button"
              disabled={verifying}
              onClick={handleVerifyOrder}
              className="w-full max-w-xs rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {verifying ? 'Verifying...' : 'Verify Order'}
            </button>
          </>
        )}
      </div>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🛒</p>
        <p className="text-lg font-semibold text-ink">Your cart is empty</p>
        <button
          onClick={() => navigate('/app/shop')}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const address = profile?.deliveryAddresses?.[0];
  const canPlaceOrder = guest
    ? !!guestEmail && !!guestName && !!guestPhone && !!guestAddressLine && !!selectedPayment
    : !!selectedPayment && !!address;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-primary">
        <Container className="flex items-center justify-between py-5 text-white">
          <button
            type="button"
            onClick={() => navigate('/app/cart')}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>
          <span className="w-10" aria-hidden />
        </Container>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {guest && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">👤 Contact Details</h3>
              <div className="mt-3 flex flex-col gap-3">
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                  className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                We'll send your order confirmation and tracking link to this email.
              </p>
            </section>
          )}

          {/* Delivery Address */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-primary">📍 Delivery Address</h3>
              {!guest && (
                <button
                  type="button"
                  onClick={() => navigate('/app/profile')}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {guest ? (
              <div className="mt-3 flex flex-col gap-3">
                <input
                  value={guestAddressLine}
                  onChange={(e) => setGuestAddressLine(e.target.value)}
                  placeholder="Street address"
                  required
                  className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={guestState}
                    onChange={(e) => setGuestState(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                  />
                  <input
                    value={guestLandmark}
                    onChange={(e) => setGuestLandmark(e.target.value)}
                    placeholder="Nearest landmark"
                    className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl bg-primary/10 p-5">
                {address ? (
                  <>
                    <p className="text-lg font-bold text-ink">{address.state}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {address.addressLine}, {address.country}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-soft">
                    No saved address. Please add one in your profile before ordering.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary">💳 Payment Method</h3>
            {paymentMethods.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                No payment methods available.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={
                      'flex cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-4 transition-colors ' +
                      (selectedPayment === method.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50')
                    }
                  >
                    <div>
                      <p className="text-base font-semibold text-ink">
                        {method.title}
                      </p>
                      {method.description && (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {method.description}
                        </p>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="h-5 w-5 accent-primary"
                    />
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Delivery Instructions */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary">📝 Delivery Instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Please ring the doorbell, leave at the door (optional)"
              rows={3}
              className="mt-3 w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
            />
          </section>

          {/* Order Summary */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-ink">Order Summary</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {cart.cartItems.map((item) => {
                const imageUrl = item.itemUrls?.[0] ?? '';
                const itemTotal = Number(item.itemPrice) * item.quantity;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 border-b border-muted/60 pb-4 last:border-0 last:pb-0"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.itemName}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                        {item.itemType === 'FOODPACK' ? '🎒' : '📦'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-ink capitalize truncate">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-ink-soft">
                        Qty: {item.quantity} × {formatNaira(Number(item.itemPrice))}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-ink">
                      {formatNaira(itemTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-muted/60 pt-5">
              <span className="text-lg font-semibold text-ink">Total</span>
              <span className="text-xl font-extrabold text-ink">
                {formatNaira(cart.subTotal)}
              </span>
            </div>
          </section>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing || !canPlaceOrder}
            className="w-full rounded-full bg-primary py-5 text-lg font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Placing Order...
              </span>
            ) : (
              `Place Order · ${formatNaira(cart.subTotal)}`
            )}
          </button>
        </div>
      </Container>
    </div>
  );
}