import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { isAuthenticated } from '../../auth/session';
import Container from '../../../components/layout/Container';
import SplashLoader from '../../../components/ui/SplashLoader';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { useAccountCart } from '../../cart/accountCart';
import { useGuestCart } from '../../cart/useGuestCart';
import CheckoutAddress from '../components/CheckoutAddress';
import CheckoutPayment from '../components/CheckoutPayment';
import CheckoutSummary from '../components/CheckoutSummary';
import GuestContactFields from '../components/GuestContactFields';
import GuestOrderVerification from '../components/GuestOrderVerification';
import { calculateCheckoutTotals } from '../totals';
import { useCheckoutOptions } from '../useCheckoutOptions';
import { useCheckoutSubmission, type GuestDetails } from '../useCheckoutSubmission';

const emptyGuestDetails: GuestDetails = {
  name: '',
  email: '',
  phone: '',
  addressLine: '',
  state: '',
  landmark: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const guest = !isAuthenticated();
  const accountCart = useAccountCart(!guest);
  const guestCart = useGuestCart();
  const options = useCheckoutOptions(true, !guest);
  const { placeOrder, placing, guestOrder } = useCheckoutSubmission();
  const [guestDetails, setGuestDetails] = useState(emptyGuestDetails);
  const [paymentId, setPaymentId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [instructions, setInstructions] = useState('');

  if (guestOrder) {
    return <GuestOrderVerification {...guestOrder} onBack={() => navigate('/')} />;
  }

  if (options.loading || (!guest && (accountCart.isPending || accountCart.isFetching))) {
    return <SplashLoader />;
  }

  const error = options.error || (!guest && accountCart.isError
    ? getApiErrorMessage(accountCart.error, 'Failed to load the cart for checkout.')
    : '');
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p role="alert" className="text-lg font-semibold text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => {
            if (options.error) options.retry();
            if (!guest && accountCart.isError) void accountCart.refetch();
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cart = guest ? guestCart : accountCart.data;
  if (!cart?.cartItems.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🛒</p>
        <p className="text-lg font-semibold text-ink">Your cart is empty</p>
        <button
          type="button"
          onClick={() => navigate('/app/shop')}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const { paymentMethods, addresses } = options;
  const payment = paymentMethods.find((method) => method.id === paymentId) ?? paymentMethods[0];
  const address = addresses.find((entry) => entry.id === addressId) ?? addresses[0];
  const hasGuestDetails = [guestDetails.email, guestDetails.name, guestDetails.phone, guestDetails.addressLine]
    .every((value) => value.trim());
  const canPlaceOrder = !!payment && (guest ? hasGuestDetails : !!address);
  const totals = calculateCheckoutTotals(cart, payment);

  function updateGuestDetails(field: keyof GuestDetails, value: string) {
    setGuestDetails((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPlaceOrder || placing || !payment || !cart) return;

    const order = { paymentMethodId: payment.id, instructions };
    if (guest) {
      void placeOrder({ ...order, kind: 'guest', details: guestDetails, items: cart.cartItems });
    } else if (address) {
      void placeOrder({ ...order, kind: 'account', addressId: address.id });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary">
        <Container className="flex items-center justify-between py-5 text-white">
          <button
            type="button"
            onClick={() => navigate('/app/cart')}
            disabled={placing}
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
        <form className="mx-auto max-w-2xl" onSubmit={handleSubmit}>
          <fieldset disabled={placing} className="min-w-0 space-y-6">
            {guest && <GuestContactFields details={guestDetails} onChange={updateGuestDetails} />}
            {guest ? (
              <CheckoutAddress kind="guest" details={guestDetails} onChange={updateGuestDetails} />
            ) : (
              <CheckoutAddress
                kind="account"
                addresses={addresses}
                selectedId={address?.id}
                onSelect={setAddressId}
                onEdit={() => navigate('/app/profile')}
              />
            )}
            <CheckoutPayment
              paymentMethods={paymentMethods}
              selectedPayment={payment?.id}
              onSelect={setPaymentId}
            />
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">📝 Delivery Instructions</h3>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="e.g. Please ring the doorbell, leave at the door (optional)"
                rows={3}
                className="mt-3 w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
              />
            </section>
            <CheckoutSummary items={cart.cartItems} totals={totals} />
            <button
              type="submit"
              disabled={placing || !canPlaceOrder}
              className="w-full rounded-full bg-primary py-5 text-lg font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Placing Order...
                </span>
              ) : (
                `Place Order · ${formatNaira(totals.total)}`
              )}
            </button>
          </fieldset>
        </form>
      </Container>
    </div>
  );
}
