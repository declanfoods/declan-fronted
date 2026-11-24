import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { isAuthenticated } from '../../auth/session';
import AppLayout from '../../../app/layouts/customer/AppLayout';
import SplashLoader from '../../../components/ui/SplashLoader';
import { useToast } from '../../../components/ui/Toast';
import { orderApi } from '../api/orderApi';
import ActiveOrderCard from '../components/ActiveOrderCard';
import PastOrderCard from '../components/PastOrderCard';
import { useOrderHistory } from '../queries';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authenticated = isAuthenticated();
  const [page, setPage] = useState(1);
  const { active, history } = useOrderHistory(authenticated, page);
  const reorder = useMutation({
    mutationFn: orderApi.readdOrder,
    onSuccess: () => {
      showToast('Items added to your reorder cart.', 'success');
      navigate('/app/reorder-cart');
    },
    onError: (error) => showToast(
      getApiErrorMessage(error, 'Could not re-order that order. Please try again.'),
      'error',
    ),
  });

  if (!authenticated) {
    return (
      <AppLayout title="My Orders">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <LogIn size={40} className="text-primary" />
          <p className="text-lg font-semibold text-ink">Login to view your orders</p>
          <p className="text-sm text-ink-soft">
            Track deliveries and see your order history once you sign in. Placed an order as a
            guest? Use the tracking link from your confirmation email instead.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Login
          </button>
        </div>
      </AppLayout>
    );
  }

  if (active.isPending) {
    return <AppLayout title="My Orders"><SplashLoader /></AppLayout>;
  }

  const activeOrder = active.data;
  const pastOrders = history.data?.orders ?? [];
  const totalPages = Math.max(page, history.data?.totalPages ?? 1);

  return (
    <AppLayout title="My Orders">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ink">Order History</h2>
          <p className="text-sm text-ink-soft">Track current deliveries and reorder past favorites.</p>
        </div>

        <section className="mb-10">
          <h3 className="mb-3 text-lg font-bold text-ink">Active Order</h3>
          {active.isError ? (
            <OrdersLoadError
              message={getApiErrorMessage(active.error, 'Failed to load the active order.')}
              onRetry={() => void active.refetch()}
            />
          ) : activeOrder ? (
            <ActiveOrderCard
              order={activeOrder}
              onTrack={() => navigate(`/app/orders/${activeOrder.id}/tracking`)}
            />
          ) : (
            <div className="rounded-3xl border-2 border-primary bg-white px-6 py-8 text-center shadow-sm">
              <p className="text-sm text-ink-soft">No active orders right now.</p>
              <button
                type="button"
                onClick={() => navigate('/app/shop')}
                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Start Shopping
              </button>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold text-ink">Past Orders</h3>
          {history.isFetching ? (
            <p className="animate-pulse py-6 text-center text-sm font-medium text-primary">Loading...</p>
          ) : history.isError ? (
            <OrdersLoadError
              message={getApiErrorMessage(history.error, 'Failed to load past orders.')}
              onRetry={() => void history.refetch()}
            />
          ) : pastOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">No past orders yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pastOrders.map((order) => (
                <PastOrderCard
                  key={order.id}
                  order={order}
                  disabled={reorder.isPending}
                  adding={reorder.isPending && reorder.variables === order.id}
                  onReorder={() => reorder.mutate(order.id)}
                  onDetails={() => navigate(`/app/orders/${order.id}/tracking`)}
                />
              ))}
            </div>
          )}

          {!history.isFetching && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={page === pageNumber ? 'page' : undefined}
                  className={
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ' +
                    (page === pageNumber
                      ? 'border-primary bg-primary text-white'
                      : 'border-primary bg-white text-primary hover:bg-primary/5')
                  }
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function OrdersLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">Try Again</button>
    </div>
  );
}
