

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../app/AppLayout';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';
import { orderApi, type Order } from '../../../app/lib/orderApi';
import { LogIn } from 'lucide-react';
import { isAuthenticated } from '../../../app/lib/auth';
import { useToast } from '../../ui/Toast';

/*
|--------------------------------------------------------------------------
| Past-order status presentation
|--------------------------------------------------------------------------
| Keyed by normalised status so odd casing or spacing from the API still maps
| to the right colour. Anything unknown falls back to neutral grey rather than
| pretending to be a success.
*/
function statusKey(status?: string) {
  return (status ?? '').toUpperCase().replace(/[\s-]+/g, '_');
}

const PAST_STATUS_PILL: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  REJECTED: 'bg-red-100 text-red-600',
  FAILED: 'bg-red-100 text-red-600',
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
};

const PAST_STATUS_TILE: Record<string, string> = {
  DELIVERED: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600',
  REJECTED: 'bg-red-50 text-red-600',
  FAILED: 'bg-red-50 text-red-600',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-blue-50 text-blue-700',
  ASSIGNED: 'bg-blue-50 text-blue-700',
  IN_TRANSIT: 'bg-blue-50 text-blue-700',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const PAGE_SIZE = 10;

export default function Orders() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [pastPage, setPastPage] = useState(1);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pastLoading, setPastLoading] = useState(false);
  const [error, setError] = useState('');
  const [readdingId, setReaddingId] = useState<string | null>(null);

  // Fetch single active order
  useEffect(() => {
    if (!isAuthenticated()) { setLoading(false); return; }
    const fetchActive = async () => {
      try {
        const res = await orderApi.getActiveOrder();
        setActiveOrder(res.data.data.order ?? null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setActiveOrder(null);
        } else {
          setError(err.response?.data?.message ?? 'Failed to load orders.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  // Fetch past orders
  useEffect(() => {
    if (!isAuthenticated()) { setLoading(false); return; }
    const fetchPast = async () => {
      setPastLoading(true);
      try {
        const res = await orderApi.getOrders({
          page: pastPage,
          limit: PAGE_SIZE,
          // status: 'DELIVERED',
        });
        setPastOrders(res.data.data.orders);
        setPastTotalPages(res.data.data.pagination.totalPages);
      } catch {
      } finally {
        setPastLoading(false);
      }
    };
    fetchPast();
  }, [pastPage]);

  /*
  |--------------------------------------------------------------------------
  | FIX: "Re-order" silently did nothing
  |--------------------------------------------------------------------------
  | Two separate bugs, both here:
  |
  | 1. WRONG DESTINATION. `POST /orders/:id/readd` adds the items to the
  |    REORDER cart, not the main cart. This then navigated to /app/cart,
  |    which shows the main cart — so the items were added successfully and
  |    the customer was shown an empty basket. Now goes to /app/reorder-cart,
  |    the screen that actually reads this cart.
  |
  | 2. SWALLOWED ERRORS. `catch {}` ate every failure, including expired
  |    sessions and out-of-stock items, so the button looked dead no matter
  |    what happened. Now it tells the customer.
  */
  const handleReadd = async (orderId: string) => {
    setReaddingId(orderId);
    try {
      await orderApi.readdOrder(orderId);
      showToast('Items added to your reorder cart.', 'success');
      navigate('/app/reorder-cart');
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ??
          'Could not re-order that order. Please try again.',
        'error'
      );
    } finally {
      setReaddingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Orders">
        <SplashLoader />
      </AppLayout>
    );
  }

  
if (!isAuthenticated()) {
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
          onClick={() => navigate('/login')}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Login
        </button>
      </div>
    </AppLayout>
  );
}

  if (error) {
    return (
      <AppLayout title="My Orders">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Orders">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ink">Order History</h2>
          <p className="text-sm text-ink-soft">
            Track current deliveries and reorder past favorites.
          </p>
        </div>

        {/* ── Active Order ───────────────────────────────────── */}
        <section className="mb-10">
          <h3 className="mb-3 text-lg font-bold text-ink">Active Order</h3>

          {!activeOrder ? (
            <div className="rounded-3xl border-2 border-primary bg-white px-6 py-8 text-center shadow-sm">
              <p className="text-sm text-ink-soft">No active orders right now.</p>
              <button
                onClick={() => navigate('/app/shop')}
                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
              {/* Order number + totals */}
              <div className="flex items-start justify-between">
                <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
                  {activeOrder.orderNumber}
                </span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-soft">
                    {formatNaira(activeOrder.totalPrice)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {activeOrder.totalQuantityOfItems}{' '}
                    {activeOrder.totalQuantityOfItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Timeline progress */}
              {activeOrder.orderTimeline && activeOrder.orderTimeline.length > 0 ? (
                <div className="mt-8">
                  <div
                    className="grid gap-1 text-center text-[10px] font-semibold sm:text-xs"
                    style={{
                      gridTemplateColumns: `repeat(${activeOrder.orderTimeline.length}, 1fr)`,
                    }}
                  >
                    {activeOrder.orderTimeline.map((event, i) => (
                      <div
                        key={i}
                        className={
                          event.passed ? 'text-primary' : 'text-ink-soft'
                        }
                      >
                        {event.label}
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: (() => {
                          const total = activeOrder.orderTimeline!.length;
                          const passed = activeOrder.orderTimeline!.filter(
                            (t) => t.passed
                          ).length;
                          if (total <= 1) return passed > 0 ? '100%' : '0%';
                          return `${((passed - 0.5) / (total - 1)) * 100}%`;
                        })(),
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Fallback static bar for PENDING with null timeline */
                <div className="mt-8">
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold sm:text-xs">
                    {['Order Placed', 'Processing', 'Picked Up', 'In Transit', 'Delivered'].map(
                      (stage, i) => (
                        <div
                          key={stage}
                          className={i === 0 ? 'text-primary' : 'text-ink-soft'}
                        >
                          {stage}
                        </div>
                      )
                    )}
                  </div>
                  <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-primary"
                      style={{ width: '10%' }}
                    />
                  </div>
                </div>
              )}

              {/* Status + actions */}
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={
                    'rounded-full px-3 py-1 text-xs font-semibold ' +
                    (activeOrder.orderStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : activeOrder.orderStatus === 'DELIVERED' ||
                          activeOrder.orderStatus === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary/10 text-primary')
                  }
                >
                  {activeOrder.orderStatus.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() =>
                    navigate(`/app/orders/${activeOrder.id}/tracking`)
                  }
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Track Live ❯
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Past Orders ────────────────────────────────────── */}
        <section>
          <h3 className="mb-3 text-lg font-bold text-ink">Past Orders</h3>

          {pastLoading && (
            <p className="py-6 text-center text-sm font-medium text-primary animate-pulse">
              Loading...
            </p>
          )}

          {!pastLoading && pastOrders.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-soft">
              No past orders yet.
            </p>
          )}

          {!pastLoading && pastOrders.length > 0 && (
            <div className="flex flex-col gap-4">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-white p-4 shadow-sm"
                >
                  {/*
                    FIX: this tile was a hardcoded "✅" and the badge below was
                    hardcoded "Delivered" — for EVERY past order, whatever its
                    real status. A cancelled order still showed a green tick.

                    Now it shows the first product's photo when the API gives
                    one, and falls back to a status-coloured tile when it
                    doesn't (imageUrls is optional).
                  */}
                  {order.items?.[0]?.imageUrls?.[0] ? (
                    <img
                      src={order.items[0].imageUrls[0]}
                      alt={order.items[0].itemName ?? 'Order item'}
                      className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${PAST_STATUS_TILE[statusKey(order.orderStatus)] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {order.items?.[0]?.itemName?.slice(0, 12) ?? 'Order'}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${PAST_STATUS_PILL[statusKey(order.orderStatus)] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {order.orderStatus?.replace(/_/g, ' ') ?? 'UNKNOWN'}
                    </span>
                    <p className="mt-2 text-sm text-ink-soft">
                      {/* Was `new Date().toISOString()` in both branches — i.e.
                          always "now". Uses the real order date. */}
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-base font-semibold text-ink">
                      {order.orderNumber} ·{' '}
                      {order.totalQuantityOfItems}{' '}
                      {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {formatNaira(order.totalPrice)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={readdingId === order.id}
                      onClick={() => handleReadd(order.id)}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                    >
                      {readdingId === order.id ? 'Adding...' : 'Re-order'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/orders/${order.id}/tracking`)}
                      className="rounded-full border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!pastLoading && pastTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {Array.from({ length: pastTotalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPastPage(pageNum)}
                    className={
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ' +
                      (pastPage === pageNum
                        ? 'border-primary bg-primary text-white'
                        : 'border-primary bg-white text-primary hover:bg-primary/5')
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}