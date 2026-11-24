import { useNavigate } from 'react-router-dom';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { OrderOverview } from '../api/userApi';

interface DashboardOrdersProps {
  orders: OrderOverview[];
  loading: boolean;
  failed: boolean;
}

export default function DashboardOrders({ orders, loading, failed }: DashboardOrdersProps) {
  const navigate = useNavigate();
  const activeOrders = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.orderStatus));

  return (
    <section aria-label="Active orders" className="rounded-2xl border border-primary px-6 py-8 text-center lg:rounded-3xl lg:border-[#e3e9df] lg:bg-[#fafbf7] lg:p-6 lg:text-left">
      {loading ? (
        <p className="text-sm text-primary/80">Loading orders...</p>
      ) : activeOrders.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-primary lg:text-xl lg:font-extrabold lg:text-[#153526]">
            {activeOrders.length} active {activeOrders.length === 1 ? 'order' : 'orders'}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {activeOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-primary/30 bg-white px-4 py-3 lg:border-[#e3e9df]"
              >
                <div className="text-left">
                  <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                    {order.orderNumber}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatNaira(Number(order.totalPrice))} · {order.totalQuantityOfItems}{' '}
                    {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/orders')}
            className="mt-4 text-sm font-semibold text-primary hover:underline lg:text-[#245b38]"
          >
            View all orders ❯
          </button>
        </div>
      ) : failed ? (
        <p className="text-sm text-red-600">Could not load active orders.</p>
      ) : (
        <>
          <h2 className="text-lg font-bold text-primary lg:text-xl lg:font-extrabold lg:text-[#153526]">No active orders</h2>
          <p className="mt-1 text-sm text-primary/80">
            Your essentials will appear here when you order
          </p>
          <button
            type="button"
            onClick={() => navigate('/app/shop')}
            className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark lg:bg-[#245b38] lg:hover:bg-[#153526]"
          >
            Start Shopping
          </button>
        </>
      )}
    </section>
  );
}
