import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Container from '../../../shared/ui/Container';
import type { Order, OrderTimelineEvent } from '../api/orderApi';
import { getTrackingPayment, isOrderDelivered, orderStatusKey, orderStatusLabel } from '../orderPresentation';
import OrderTimeline from './OrderTimeline';
import { PaymentRequiredBanner } from './PaymentRequiredBanner';
import TrackingOrderSummary from './TrackingOrderSummary';
import TrackingPayment from './TrackingPayment';

type OrderTrackingViewProps = {
  order: Order;
  timeline: OrderTimelineEvent[];
  mode: 'account' | 'guest';
  onBack: () => void;
  footer?: ReactNode;
  notice?: ReactNode;
};

export default function OrderTrackingView({ order, timeline, mode, onBack, footer, notice }: OrderTrackingViewProps) {
  const delivered = isOrderDelivered(order.orderStatus);
  const cancelled = orderStatusKey(order.orderStatus) === 'CANCELLED';
  const deliveryCode = String(order.delivery?.deliveryCode ?? '');
  const { requiresUpfrontPayment, paysByTransfer, transferCharge, totalWithCharge } = getTrackingPayment(order, mode);
  const deliveredBackLabel = mode === 'account' ? 'Back to My Orders' : 'Back to Home';
  const statusLabel = cancelled ? 'Order cancelled'
    : delivered ? 'Order delivered! 🎉'
    : `Status: ${orderStatusLabel(order.orderStatus)}`;

  return (
    <div className="min-h-screen bg-white">
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
          {notice}
          {requiresUpfrontPayment && !delivered && !cancelled && (
            <PaymentRequiredBanner
              orderNumber={order.orderNumber}
              totalWithCharge={totalWithCharge}
              transferCharge={transferCharge}
            />
          )}
          {deliveryCode && !delivered && !cancelled && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary">
                Delivery Verification Code
              </h2>
              <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
                {deliveryCode.split('').map((digit, index) => (
                  <div
                    key={index}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary text-3xl font-extrabold text-white sm:h-20 sm:w-20 sm:text-4xl"
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-base text-ink-soft">Give this code to the rider upon delivery</p>
            </section>
          )}
          <section className={`rounded-3xl border-2 p-4 sm:p-5 ${
            cancelled ? 'border-red-200 bg-red-50' : 'border-accent bg-accent/10'
          }`}>
            <div className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>
                <span className={`mr-1 inline-block h-2 w-2 rounded-full ${cancelled ? 'bg-red-400' : 'bg-accent'}`} />
                {statusLabel}
              </span>
              <span className="text-xs text-ink-soft">{order.orderNumber}</span>
            </div>
          </section>

          <OrderTimeline timeline={timeline} estimatedDeliveryTime={order.estimatedDeliveryTime} />

          {order.delivery?.deliveryAddressLine && (
            <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">📍 Delivery Address</h3>
              <div className="mt-3 rounded-2xl bg-primary/10 p-5">
                <p className="text-sm leading-relaxed text-ink-soft">{order.delivery.deliveryAddressLine}</p>
                {order.delivery.deliveryInstruction && (
                  <p className="mt-2 text-sm text-ink-soft">
                    <span className="font-semibold text-ink">Note: </span>
                    {order.delivery.deliveryInstruction}
                  </p>
                )}
              </div>
            </section>
          )}
          {order.payment && <TrackingPayment payment={order.payment} mode={mode} paysByTransfer={paysByTransfer} />}
          <TrackingOrderSummary
            order={order}
            mode={mode}
            transferCharge={transferCharge}
            totalWithCharge={totalWithCharge}
          />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-full bg-primary py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark"
            >
              {delivered ? deliveredBackLabel : 'View All Orders'}
            </button>
            {footer}
          </div>
        </div>
      </Container>
    </div>
  );
}
