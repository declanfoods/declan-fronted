import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  User,
  Phone,
  UtensilsCrossed,
  HeadphonesIcon,
} from 'lucide-react';
import { adminOrderApi, type AdminOrder } from '../../../../app/lib/adminOrderApi';
import StatusPill from '../../../admin/StatusPill';

function formatAmount(amount: unknown) {
  const num = Number(amount);
  return Number.isNaN(num) ? '—' : `₦${num.toLocaleString()}`;
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminOrderApi.getOrderById(id);
      setOrder(res.data.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleMarkProcessing = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminOrderApi.markAsProcessing(id);
      fetchOrder();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update order.');
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
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
        <div className="rounded-2xl bg-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <UtensilsCrossed size={16} />
              </span>
              <div>
                <p className="text-xs text-white/80">CURRENT STATE</p>
                <p className="font-bold">{order.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">Order</p>
              <p className="font-bold">#{order.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-gray-400">CUSTOMER</p>
            <User size={16} className="text-gray-300" />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
              {(order.customer?.name ?? 'C').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="font-bold text-gray-900">{order.customer?.name ?? 'Customer'}</p>
              {order.customer?.phone && (
                <p className="text-sm text-gray-500">{order.customer.phone}</p>
              )}
            </div>
          </div>
        </section>

        {order.rider && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">
              ASSIGNED RIDER
            </p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{order.rider.name}</p>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7EE] text-primary"
              >
                <Phone size={16} />
              </button>
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Ordered Items</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {order.items?.length ?? 0} Items
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {(order.items ?? []).map((item, idx) => (
              <div key={item.id ?? idx} className="flex items-center gap-3 py-3">
                {item.imageUrls?.[0] && (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatAmount(item.price)}</p>
              </div>
            ))}
            {(!order.items || order.items.length === 0) && (
              <p className="py-3 text-sm text-gray-400">No item details available.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Order Summary</h2>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-primary">{formatAmount(order.totalAmount)}</span>
          </div>
          {order.paymentStatus && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F3F7EE] p-3">
              <p className="text-sm font-semibold text-gray-800">Payment Status</p>
              <StatusPill label={order.paymentStatus} />
            </div>
          )}
        </section>

        <div className="flex flex-col items-center gap-4 pb-2 pt-2">
          <button type="button" className="flex items-center gap-2 text-sm font-semibold text-primary">
            <HeadphonesIcon size={16} />
            Contact Customer Support
          </button>
        </div>
      </main>

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
          disabled={actionLoading}
          onClick={handleMarkProcessing}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {actionLoading ? 'Updating...' : 'Mark as Processing'}
        </button>
      </div>
    </div>
  );
}
