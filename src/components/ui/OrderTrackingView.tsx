import { ArrowLeft } from 'lucide-react';
import Container from '../layout/Container';
import { formatNaira } from '../data/products';
import type { Order, OrderTimelineEvent } from '../../app/lib/orderApi';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type OrderTrackingViewProps = {
  order: Order;
  timeline: OrderTimelineEvent[];
  onBack: () => void;
  backLabel?: string;
};

export default function OrderTrackingView({
  order,
  timeline,
  onBack,
  backLabel = 'View All Orders',
}: OrderTrackingViewProps) {
  const isDelivered = ['DELIVERED', 'COMPLETED'].includes(order.orderStatus);
  const deliveryCode = order.delivery?.deliveryCode ?? '';
  const codeDigits = deliveryCode ? deliveryCode.split('') : [];
  const passedCount = timeline.filter((t) => t.passed).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-primary">
        <Container className="flex items-center justify-between py-5 text-white">
          <button
            type="button"
            onClick={onBack}
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
          {/* Delivery code — only show if not yet delivered */}
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
          <section className="rounded-3xl border-2 border-accent bg-accent/10 p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />
                {isDelivered
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

              {/* Progress bar */}
              <div
                className="mb-4 grid gap-x-2 gap-y-1 text-center text-[10px] font-semibold leading-snug sm:text-xs"
                style={{ gridTemplateColumns: `repeat(${timeline.length}, 1fr)` }}
              >
                {timeline.map((event, i) => (
                  <div
                    key={i}
                    className={
                      'px-0.5 ' + (event.passed ? 'text-primary' : 'text-ink-soft')
                    }
                  >
                    {event.label}
                  </div>
                ))}
              </div>
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

              {/* Event list */}
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
                            'w-0.5 flex-1 ' + (event.passed ? 'bg-primary' : 'bg-muted')
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
                        <p className="text-xs text-ink-soft">{formatDate(event.passedAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
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
                      <p className="text-base font-semibold text-ink capitalize">
                        {item.itemName}
                      </p>
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

            <div className="mt-5 flex items-center justify-between border-t border-muted/60 pt-5">
              <span className="text-lg font-semibold text-ink">Total</span>
              <span className="text-xl font-extrabold text-ink">
                {formatNaira(order.totalPrice)}
              </span>
            </div>
          </section>

          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-full bg-primary py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark"
          >
            {isDelivered ? backLabel : 'View All Orders'}
          </button>
        </div>
      </Container>
    </div>
  );
}