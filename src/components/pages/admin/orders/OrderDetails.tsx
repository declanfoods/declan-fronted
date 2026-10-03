import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  User,
  Phone,
  UtensilsCrossed,
  HeadphonesIcon,
  UserX,
} from 'lucide-react';

import {
  adminOrderApi,
  type AdminOrderDetails,
} from '../../../../app/lib/adminOrderApi';

import StatusPill from '../../../admin/StatusPill';
import MarkOrderProcessingModal from '../../../ui/MarkOrderProcessingModal';
import { useToast } from '../../../ui/Toast';

function formatAmount(amount: unknown) {
  const num = Number(amount);
  return Number.isNaN(num) ? '—' : `₦${num.toLocaleString()}`;
}

const isGuest = (customerType: string) =>
  customerType?.toUpperCase() === 'GUEST';

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const { showToast } = useToast();

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminOrderApi.getOrderById(id);
      setOrder(res.data.data.order);
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleMarkProcessing = async (note: string, estimatedDeliveryTime: string) => {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await adminOrderApi.markAsProcessing(id, {
        note,
        estimatedDeliveryTime: new Date(estimatedDeliveryTime).toISOString(),
      });
      setShowProcessingModal(false);
      showToast('Order marked processing', 'success');
      await fetchOrder();
    } catch (err: any) {
      showToast(
        err.response?.data?.message ?? 'Failed to mark order as processing',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7EE]">
        <p className="text-sm text-gray-400">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F3F7EE] px-5">
        <p className="text-sm text-red-500">{error || 'Order not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const guest = isGuest(order.customer.customerType);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Order Details</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        {/* Current state */}
        <div className="rounded-2xl bg-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <UtensilsCrossed size={16} />
              </span>
              <div>
                <p className="text-xs text-white/80">CURRENT STATE</p>
                <p className="font-bold">{order.orderStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">Order</p>
              <p className="font-bold">#{order.orderNumber ?? order.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-gray-400">CUSTOMER</p>
            <User size={16} className="text-gray-300" />
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
              {order.customer.fullname.slice(0, 2).toUpperCase()}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-gray-900">{order.customer.fullname}</p>
                {guest && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 border border-amber-200">
                    <UserX size={11} />
                    Guest
                  </span>
                )}
              </div>

              {/* Phone number */}
              {order.customer.phoneNumber ? (
                <a
                  href={`tel:${order.customer.phoneNumber}`}
                  className="mt-0.5 flex items-center gap-1.5 text-sm text-primary"
                >
                  <Phone size={13} />
                  {order.customer.phoneNumber}
                </a>
              ) : (
                <p className="mt-0.5 text-sm text-gray-400">No phone on record</p>
              )}

              {/* Guest notice */}
              {guest && (
                <p className="mt-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  This order was placed by a guest — no account is linked to it.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold tracking-wide text-gray-400">DELIVERY ADDRESS</p>
            <p className="mt-1 text-sm text-gray-700">{order.customer.addressLine}</p>
          </div>
        </section>

        {/* Rider */}
        {order.deliveryRider && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">
              ASSIGNED RIDER
            </p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">
                {order.deliveryRider.fullname ?? order.deliveryRider.name ?? 'Rider'}
              </p>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7EE] text-primary"
              >
                <Phone size={16} />
              </button>
            </div>
          </section>
        )}

        {/* Items */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Ordered Items</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {order.orderItems.length} Items
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item, index) => (
              <div key={item.id ?? index} className="flex items-center gap-3 py-3">
                {item.imageUrls?.[0] && (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.itemName ?? item.name ?? 'Product'}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {/* API returns itemName; fall back to name for safety */}
                    {item.itemName ?? item.name ?? 'Product'}
                  </p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity ?? 0}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {/* API returns unitPrice; fall back to price for safety */}
                  {formatAmount(item.unitPrice ?? item.price)}
                </p>
              </div>
            ))}
            {order.orderItems.length === 0 && (
              <p className="py-3 text-sm text-gray-400">No item details available.</p>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatAmount(order.orderSummary.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>{formatAmount(order.orderSummary.deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span>{formatAmount(order.orderSummary.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-primary">{formatAmount(order.orderSummary.total)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F3F7EE] p-3">
            <p className="text-sm font-semibold text-gray-800">Payment Status</p>
            <StatusPill label={order.payment.paymentStatus} />
          </div>
        </section>

        <div className="flex flex-col items-center gap-4 pb-2 pt-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <HeadphonesIcon size={16} />
            Contact Customer Support
          </button>
        </div>
      </main>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}/assign-rider`)}
          className="flex-1 rounded-full border-2 border-primary py-3 text-sm font-semibold text-primary"
        >
          Assign Rider
        </button>
        <button
          type="button"
          disabled={actionLoading || order.orderStatus !== 'PENDING'}
          onClick={() => setShowProcessingModal(true)}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Mark as Processing
        </button>
      </div>

      {showProcessingModal && (
        <MarkOrderProcessingModal
          loading={actionLoading}
          onClose={() => setShowProcessingModal(false)}
          onConfirm={handleMarkProcessing}
        />
      )}
    </div>
  );
}