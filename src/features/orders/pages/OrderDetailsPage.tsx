import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import SplashLoader from '../../../shared/ui/SplashLoader';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { formatOrderDate, isOrderDelivered, orderStatusLabel } from '../orderPresentation';
import { useOrderDetails } from '../queries';

export default function OrderDetailsPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const details = useOrderDetails(orderId);
  const order = details.data?.order;

  if (orderId && details.isPending) return <SplashLoader />;
  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-lg font-semibold text-red-600">{details.isError ? 'Failed to load order.' : 'Order not found'}</p>
        <button onClick={() => navigate('/app/orders')} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">
          Back to Orders
        </button>
      </div>
    );
  }

  const timeline = details.data?.timeline ?? [];
  const date = formatOrderDate(order, timeline, true);
  const delivered = isOrderDelivered(order.orderStatus);

  return (
    <AppLayout title="Order Details">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate('/app/orders')} className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
                {order.orderNumber}
              </span>
              {date && <p className="mt-2 text-xs text-ink-soft">{date}</p>}
            </div>
            <div className="text-right">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                delivered ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
              }`}>
                {orderStatusLabel(order.orderStatus)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="mt-6 space-y-2">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${event.passed ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`${event.passed ? 'text-ink' : 'text-ink-soft'}`}>{event.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mt-6 rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink mb-4">Items</h3>
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-muted/60 last:border-0">
              {item.imageUrls?.[0] ? (
                <img src={item.imageUrls[0]} alt={item.itemName} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl">📦</div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink capitalize">{item.itemName}</p>
                <p className="text-xs text-ink-soft">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-ink">{formatNaira(Number(item.unitPrice) * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Delivery */}
        {order.delivery && (
          <div className="mt-6 rounded-2xl bg-muted/60 p-5">
            <p className="text-sm font-bold text-ink mb-2">📍 Delivery</p>
            <p className="text-sm text-ink-soft">{order.delivery.deliveryAddressLine}</p>
            {order.delivery.deliveryInstruction && (
              <p className="mt-1 text-sm text-ink-soft"><strong>Note:</strong> {order.delivery.deliveryInstruction}</p>
            )}
          </div>
        )}

        {/* Total */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-6 py-4">
          <span className="text-lg font-semibold text-ink">Total</span>
          <span className="text-2xl font-extrabold text-ink">{formatNaira(order.totalPrice)}</span>
        </div>
      </div>
    </AppLayout>
  );
}
