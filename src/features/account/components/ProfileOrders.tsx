import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { userApi, type OrderOverview } from '../api/userApi';
import { formatProfileDate } from '../formatters';

const statusColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-700';

    case 'CANCELLED':
      return 'bg-red-100 text-red-700';

    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';

    default:
      return 'bg-primary/10 text-primary';
  }
};

export default function ProfileOrders() {
  const navigate = useNavigate();
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<OrderOverview[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const toggleOrders = async () => {
    setOrdersOpen(!ordersOpen);
    if (ordersOpen || orders || ordersLoading) return;

    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { data } = await userApi.getOrdersOverview();
      setOrders(data.data.orders ?? []);
    } catch (error) {
      setOrdersError(getApiErrorMessage(error, 'Failed to load orders.'));
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleOrders}
        aria-expanded={ordersOpen}
        className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-ink">
          <span
            className="text-primary"
            aria-hidden
          >
            📋
          </span>

          My Orders
        </span>

        <span className="text-primary">
          {ordersOpen ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </span>
      </button>

      {ordersOpen && (
        <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">

          {ordersLoading && (
            <p className="animate-pulse py-6 text-center text-sm font-medium text-primary">
              Loading orders...
            </p>
          )}

          {ordersError && (
            <p className="py-4 text-center text-sm font-medium text-red-600">
              {ordersError}
            </p>
          )}

          {orders &&
            orders.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-ink-soft">
                  No orders yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/app/shop')
                  }
                  className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Start Shopping
                </button>
              </div>
            )}

          {orders &&
            orders.length > 0 && (
              <div className="flex flex-col gap-3">

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border border-muted bg-white px-4 py-3"
                  >
                    <div>
                      <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                        {order.orderNumber}
                      </span>

                      <p className="mt-1 text-xs text-ink-soft">
                        {formatProfileDate(
                          order.createdAt
                        )}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-ink">
                        {formatNaira(
                          Number(
                            order.totalPrice
                          )
                        )}{' '}
                        ·{' '}
                        {
                          order.totalQuantityOfItems
                        }{' '}
                        {order.totalQuantityOfItems ===
                        1
                          ? 'item'
                          : 'items'}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.replace(
                        /_/g,
                        ' '
                      )}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    navigate('/app/orders')
                  }
                  className="mt-2 text-center text-sm font-semibold text-primary hover:underline"
                >
                  View full order history ❯
                </button>
              </div>
            )}
        </div>
      )}
    </>
  );
}
