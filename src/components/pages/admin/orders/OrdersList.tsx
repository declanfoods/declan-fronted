import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Plus,
  Bike,
} from 'lucide-react';

import AdminBottomNav from '../../../admin/AdminBottomNav';
import StatusPill from '../../../admin/StatusPill';
import OrderActionsSheet from './OrderActionsSheet';

import {
  adminOrderApi,
  type AdminOrder,
  type AdminOrderStatus,
} from '../../../../app/lib/adminOrderApi';

const filters: {
  label: string;
  status?: AdminOrderStatus;
}[] = [
  { label: 'All' },
  { label: 'Pending', status: 'PENDING' },
  { label: 'Processing', status: 'PROCESSING' },
  { label: 'Assigned', status: 'ASSIGNED' },
  { label: 'In Transit', status: 'IN_TRANSIT' },
  { label: 'Delivered', status: 'DELIVERED' },
];

function formatAmount(amount: unknown) {
  const num = Number(amount);

  return Number.isNaN(num)
    ? '—'
    : `₦${num.toLocaleString()}`;
}

function formatTime(dateString?: string) {
  if (!dateString) return '';

  const d = new Date(dateString);

  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersList() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionsOrder, setActionsOrder] =
    useState<AdminOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const status = filters.find(
        (f) => f.label === activeFilter
      )?.status;

      const res = await adminOrderApi.getOrders({
        status,
      });

      setOrders(res.data.data.orders);
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          'Failed to load orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F3F7EE]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary-dark"
        >
          <ArrowLeft
            size={22}
            strokeWidth={2}
          />
        </button>

        <h1 className="text-lg font-bold text-primary-dark">
          Orders
        </h1>

        <button
          type="button"
          className="text-primary-dark"
        >
          <MoreVertical
            size={22}
            strokeWidth={2}
          />
        </button>
      </header>

      {/* Search */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            placeholder="Search order ID, customer..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() =>
              setActiveFilter(filter.label)
            }
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === filter.label
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <main className="flex-1 space-y-3 px-5 pb-28 pt-4">
        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p className="py-10 text-center text-sm text-gray-400">
            Loading orders...
          </p>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          orders.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No orders found.
            </p>
          )}

        {/* Order Cards */}
        {!loading &&
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              {/* Customer */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/orders/${order.id}`
                    )
                  }
                  className="flex items-center gap-3 text-left"
                >
                  {/* Customer Initials */}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F7EE] text-sm font-bold text-primary-dark">
                    {(order.customer?.fullname ?? 'C')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>

                  <div>
                    {/* Customer Name */}
                    <p className="font-bold text-gray-900">
                      {order.customer?.fullname ??
                        'Customer'}
                    </p>

                    {/* Order Number */}
                    <p className="text-xs text-gray-400">
                      {order.orderNumber ??
                        `#${order.id.slice(0, 8)}`}
                    </p>
                  </div>
                </button>

                {/* Actions */}
                <button
                  type="button"
                  onClick={() =>
                    setActionsOrder(order)
                  }
                  aria-label="Order actions"
                  className="text-gray-400"
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Amount / Items */}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">
                    Amount
                  </p>

                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">
                      {formatAmount(order.amount)}
                    </p>

                    {order.paid !== undefined && (
                      <StatusPill
                        label={
                          order.paid
                            ? 'PAID'
                            : 'UNPAID'
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Items
                  </p>

                  <p className="font-bold text-gray-900">
                    {order.numberOfItems ?? 0} Items
                  </p>
                </div>
              </div>

              {/* Status / Time */}
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <StatusPill
                  label={order.orderStatus}
                  dot
                />

                <p className="text-xs text-gray-400">
                  {formatTime(order.placedAt)}
                </p>
              </div>

              {/* Rider */}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Bike
                  size={14}
                  className="text-gray-400"
                />

                {order.rider?.fullname ??
                  'Unassigned'}
              </div>
            </div>
          ))}
      </main>

      {/* Create Manual Order */}
      <button
        type="button"
        className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus
          size={16}
          strokeWidth={2.5}
        />

        Create Manual Order
      </button>

      {/* Bottom Navigation */}
      <AdminBottomNav />

      {/* Actions Sheet */}
      {actionsOrder && (
        <OrderActionsSheet
          orderId={actionsOrder.id}
          orderNumber={actionsOrder.orderNumber}
          customerPhone={undefined}
          onClose={() =>
            setActionsOrder(null)
          }
          onNavigate={(path) => {
            setActionsOrder(null);
            navigate(path);
          }}
        />
      )}
    </div>
  );
}