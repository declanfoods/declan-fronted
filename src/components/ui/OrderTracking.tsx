import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Container from '../layout/Container';
import SplashLoader from './SplashLoader';
import { formatNaira } from '../data/products';
import { orderApi, type Order, type OrderTimelineEvent } from '../../app/lib/orderApi';
import { PaymentRequiredBanner } from './PaymentRequiredBanner';
import { CancelOrderModal } from './CancelOrderModal';


function getTransferCharge(amount: number): number {
  if (amount >= 30_000) return 150;
  if (amount >= 10_000) return 100;
  return 50;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

const isCancellable = (status: string) => status === 'PENDING';

/**
 * Returns true when at least one item in the order requires payment before
 * delivery. This drives the payment-required banner, the transfer charge, and
 * the WhatsApp proof-of-payment prompt.
 */
const requiresPaymentBeforeDelivery = (order: Order): boolean =>
  order.items.some((item) => item.acceptPaymentOnDelivery === false);



// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await orderApi.getOrderById(orderId);
      setOrder(res.data.data.order);
      setTimeline(
        res.data.data.orderTimeline ?? res.data.data.order.orderTimeline ?? []
      );
    } catch {
      setError('Failed to load order tracking.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchOrder();
      setLoading(false);
    };
    init();

    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async (reason: string) => {
    if (!orderId) return;
    setCancelling(true);
    setCancelError('');
    try {
      await orderApi.cancelOrder(orderId, { reason: reason || undefined });
      setShowCancelModal(false);
      await fetchOrder();
    } catch (err: any) {
      setCancelError(
        err.response?.data?.message ?? 'Failed to cancel order. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <SplashLoader />;

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-ink">{error || 'Order not found'}</p>
        <button
          onClick={() => navigate('/app/orders')}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isDelivered   = ['DELIVERED', 'COMPLETED'].includes(order.orderStatus);
  const isCancelled   = order.orderStatus === 'CANCELLED';
  const canCancel     = isCancellable(order.orderStatus);
  const needsPayment  = requiresPaymentBeforeDelivery(order);
  const transferCharge = needsPayment ? getTransferCharge(order.totalPrice) : 0;
  const totalWithCharge = order.totalPrice + transferCharge;

  const deliveryCode  = order.delivery?.deliveryCode ?? '';
  const codeDigits    = deliveryCode ? deliveryCode.split('') : [];
  const passedCount   = timeline.filter((t) => t.passed).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-primary">
        <Container className="flex items-center justify-between py-5 text-white">
          <button
            type="button"
            onClick={() => navigate('/app/orders')}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold sm:text-2xl">Track Order</h1>
          <span className="w-10" aria-hidden />
        </Container>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Payment required banner — shown when order needs upfront payment
              and hasn't been delivered or cancelled yet */}
          {needsPayment && !isDelivered && !isCancelled && (
            <PaymentRequiredBanner
              orderNumber={order.orderNumber}
              totalWithCharge={totalWithCharge}
              transferCharge={transferCharge}
            />
          )}

          {/* Delivery code */}
          {codeDigits.length > 0 && !isDelivered && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary">
                Delivery Verification Code
              </h2>
              <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
                {codeDigits.map((digit, i) => (
                  <div
                    key={i}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary text-3xl font-extrabold text-white sm:h-20 sm:w-20 sm:text-4xl"
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-base text-ink-soft">
                Give this code to the rider upon delivery
              </p>
            </section>
          )}

          {/* Status banner */}
          <section
            className={`rounded-3xl border-2 p-4 sm:p-5 ${
              isCancelled ? 'border-red-200 bg-red-50' : 'border-accent bg-accent/10'
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>
                <span
                  className={`mr-1 inline-block h-2 w-2 rounded-full ${
                    isCancelled ? 'bg-red-400' : 'bg-accent'
                  }`}
                />
                {isCancelled
                  ? 'Order cancelled'
                  : isDelivered
                  ? 'Order delivered! 🎉'
                  : `Status: ${order.orderStatus.replace(/_/g, ' ')}`}
              </span>
              <span className="text-xs text-ink-soft">{order.orderNumber}</span>
            </div>
          </section>

          {/* Timeline */}
          {timeline.length > 0 && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-ink">Order Progress</h3>

              <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width:
                      timeline.length > 1
                        ? `${((passedCount - 0.5) / (timeline.length - 1)) * 100}%`
                        : passedCount > 0
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>

              <div className="mt-6 flex flex-col gap-0">
                {timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={
                          'h-4 w-4 rounded-full border-2 ' +
                          (event.passed
                            ? 'border-primary bg-primary'
                            : 'border-muted bg-white')
                        }
                      />
                      {idx < timeline.length - 1 && (
                        <div
                          className={
                            'w-0.5 flex-1 ' +
                            (event.passed ? 'bg-primary' : 'bg-muted')
                          }
                          style={{ minHeight: '24px' }}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <p
                        className={
                          'text-sm font-semibold ' +
                          (event.passed ? 'text-ink' : 'text-ink-soft')
                        }
                      >
                        {event.label}
                      </p>
                      {event.passedAt && (
                        <p className="text-xs text-ink-soft">
                          {formatDate(event.passedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <i className="text-gray-500">
                  Estimated Delivery time:{' '}
                  {formatDate(order.estimatedDeliveryTime?.toString() ?? '')}
                </i>
              </div>
            </section>
          )}

          {/* Delivery address */}
          {order.delivery?.deliveryAddressLine && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">📍 Delivery Address</h3>
              <div className="mt-3 rounded-2xl bg-primary/10 p-5">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {order.delivery.deliveryAddressLine}
                </p>
                {order.delivery.deliveryInstruction && (
                  <p className="mt-2 text-sm text-ink-soft">
                    <span className="font-semibold text-ink">Note: </span>
                    {order.delivery.deliveryInstruction}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Payment info */}
          {order.payment && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">💳 Payment</h3>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {order.payment.paymentMethod}
                  </p>
                  <span
                    className={
                      'mt-1 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ' +
                      (order.payment.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700')
                    }
                  >
                    {order.payment.paymentStatus}
                  </span>
                </div>
                <p className="text-xl font-extrabold text-ink">
                  {formatNaira(order.payment.amount)}
                </p>
              </div>
            </section>
          )}

          {/* Order items summary */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-ink">Order Summary</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {order.orderNumber}
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-4">
              {order.items.map((item) => {
                const imageUrl = item.imageUrls?.[0] ?? '';
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
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-base font-semibold capitalize text-ink">
                          {item.itemName}
                        </p>
                        {item.acceptPaymentOnDelivery && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Pay before delivery
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-soft">
                        Qty: {item.quantity} × {formatNaira(Number(item.unitPrice))}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-ink">
                      {formatNaira(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Totals breakdown */}
            <div className="mt-5 space-y-2 border-t border-muted/60 pt-5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Items subtotal</span>
                <span>{formatNaira(order.priceOfItems)}</span>
              </div>
              {order.deliveryPrice > 0 && (
                <div className="flex justify-between text-ink-soft">
                  <span>Delivery fee</span>
                  <span>{formatNaira(order.deliveryPrice)}</span>
                </div>
              )}
              {needsPayment && (
                <div className="flex justify-between text-amber-700">
                  <span>Transfer charge</span>
                  <span>{formatNaira(transferCharge)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-muted/60 pt-3 text-base font-bold text-ink">
                <span>Total to pay</span>
                <span>{formatNaira(totalWithCharge)}</span>
              </div>
            </div>
          </section>

          {cancelError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {cancelError}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/app/orders')}
              className="w-full rounded-full bg-primary py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark"
            >
              {isDelivered ? 'Back to My Orders' : 'View All Orders'}
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                className="w-full rounded-full border-2 border-red-300 py-4 text-lg font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </Container>

      {showCancelModal && (
        <CancelOrderModal
          loading={cancelling}
          onClose={() => {
            setShowCancelModal(false);
            setCancelError('');
          }}
          onConfirm={handleCancelOrder}
        />
      )}
    </div>
  );
}