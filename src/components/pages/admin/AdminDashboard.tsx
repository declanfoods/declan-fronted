import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Menu,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Plus,
  RefreshCw,
  Loader2,
  Package,
  ShoppingBasket,
  AlertTriangle,
} from 'lucide-react';
import AdminBottomNav from '../../admin/AdminBottomNav';
import AdminDrawer from '../../admin/AdminDrawer';
import Logo from '../../ui/Logo';
import { formatNaira } from '../../data/products';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { adminDashboardApi } from '../../../app/lib/adminDashboardApi';
import type {
  AdminDashboardOverview,
  DashboardTopItem,
} from '../../../app/lib/adminDashboardApi';
import { queryKeys } from '../../../app/lib/query-client';

/*
|==========================================================================
| ADMIN → DASHBOARD   /admin
|==========================================================================
|
| THIS PAGE WAS ENTIRELY HARDCODED. Every card on it was a literal in this
| file — "Revenue increased by 18% compared to yesterday's mid-day average",
| "Order volumes peak between 12 PM and 3 PM daily", three invented low-stock
| rows, two invented top products, one invented top food pack, and a "Recent
| Activity" list of events that never happened.
|
| It now runs on GET /api/v1/admin/dashboard/overview, which returns exactly
| five things:
|
|   revenueInsight  { todayRevenue, yesterdaySameTimeRevenue,
|                     changePercentage|null, direction }
|   peakHours       { peakStartHour, peakEndHour, description }
|   lowStockAlerts  [ { productId, productName, quantityLeft } ]
|   topProducts     [ { itemId, name, imageUrls[], totalSold, totalRevenue } ]
|   topFoodPacks    [ same shape ]
|
| ── WHAT WAS DELETED, AND WHY ────────────────────────────────────────────
| "Recent Activity" is GONE. The endpoint has no activity feed and no other
| endpoint supplies one, so those three rows could only ever have been
| invented. Leaving a fake feed on a page where every other number is now
| real is worse than leaving a gap — an admin would have no way to tell which
| half of the screen to trust. The section comes back the day there is an
| endpoint behind it.
|
| ── TWO PAYLOAD DETAILS HANDLED HERE ─────────────────────────────────────
| 1. `changePercentage` IS NULL when yesterday has no comparable figure, and
|    `direction` is the string 'up' | 'down' | 'neutral'. Null is "no
|    comparison available", not "no change", so the card says exactly that
|    instead of printing 0%. The arrow follows `direction` — 'neutral' gets a
|    dash, not an up arrow.
| 2. `imageUrls` is an ARRAY and can be empty or hold duplicates (the saved
|    foodpack sample repeats the same URL twice). The thumbnail takes the
|    first entry and falls back to an icon when there is none.
|
| `todayRevenue`, `totalRevenue` and `totalSold` are plain numbers here, not
| the money strings used elsewhere in this API.
*/

/** One leaderboard row — products and food packs share the shape. */
function TopItemRow({
  item,
  isProduct,
}: {
  item: DashboardTopItem;
  isProduct: boolean;
}) {
  /*
    First image only. The array can be empty, and the saved samples show it
    repeating the same URL, so index 0 with a fallback is the whole job.
  */
  const thumb = item.imageUrls?.[0];

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt={item.name}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F7EE] text-primary">
            {isProduct ? <Package size={16} /> : <ShoppingBasket size={16} />}
          </span>
        )}
        <p className="min-w-0 truncate text-sm font-medium text-gray-700">
          {item.name}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-primary">
          {Number(item.totalSold ?? 0)} Sold
        </p>
        <p className="text-xs text-gray-400">
          {formatNaira(Number(item.totalRevenue ?? 0))}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const overviewQuery = useQuery<AdminDashboardOverview, Error>({
    queryKey: queryKeys.adminDashboardOverview,
    queryFn: async () => {
      const res = await adminDashboardApi.getOverview();
      return res.data.data;
    },
  });

  const data = overviewQuery.data;
  const revenue = data?.revenueInsight;
  const peak = data?.peakHours;
  const lowStock = data?.lowStockAlerts ?? [];
  const topProducts = data?.topProducts ?? [];
  const topFoodPacks = data?.topFoodPacks ?? [];

  /*
    'up' | 'down' | 'neutral' drives the icon. Anything unexpected is treated
    as neutral rather than guessed at.
  */
  const direction = revenue?.direction ?? 'neutral';
  const RevenueIcon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-between px-5 pt-6">
        <Logo className="h-10 w-auto" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => overviewQuery.refetch()}
            disabled={overviewQuery.isFetching}
            aria-label="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={overviewQuery.isFetching ? 'animate-spin' : ''}
            />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-24 pt-6">
        {/* ─── Loading ─── */}
        {overviewQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading dashboard…</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {overviewQuery.isError && !overviewQuery.isLoading && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                overviewQuery.error,
                'Could not load the dashboard.'
              )}
            </p>
            <button
              type="button"
              onClick={() => overviewQuery.refetch()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {data && !overviewQuery.isError && (
          <>
            {/* ─── Revenue insight ─── */}
            {revenue && (
              <div className="rounded-2xl bg-primary p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <RevenueIcon size={16} strokeWidth={2} />
                    Revenue Insight
                  </div>
                  <span className="text-sm font-bold">
                    {formatNaira(Number(revenue.todayRevenue ?? 0))}
                  </span>
                </div>

                <p className="mt-1 text-sm text-white/90">
                  {revenue.changePercentage === null ||
                  revenue.changePercentage === undefined ? (
                    /*
                      No comparable figure for yesterday — say that, rather
                      than showing "0%" which reads as "flat".
                    */
                    <>
                      Today so far. No comparison available for the same time
                      yesterday.
                    </>
                  ) : (
                    <>
                      {direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'Level'}{' '}
                      {Math.abs(Number(revenue.changePercentage))}% against the same
                      time yesterday
                      {revenue.yesterdaySameTimeRevenue > 0 && (
                        <>
                          {' '}
                          ({formatNaira(Number(revenue.yesterdaySameTimeRevenue))})
                        </>
                      )}
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            {/* ─── Peak hours ─── */}
            {peak && (
              <div className="rounded-2xl bg-gray-900 p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock size={16} strokeWidth={2} />
                  Peak Hours
                </div>
                {/* Server-written sentence — shown as-is, not re-worded. */}
                <p className="mt-1 text-sm text-white/80">{peak.description}</p>
              </div>
            )}

            {/* ─── Low stock ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Low Stock Alerts
                </h2>
                {lowStock.length > 0 && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    {lowStock.length}
                  </span>
                )}
              </div>

              {lowStock.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Nothing is running low. Every product has healthy stock.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        <p className="min-w-0 truncate text-sm text-gray-700">
                          {item.productName}{' '}
                          <span className="text-red-500">
                            ({Number(item.quantityLeft ?? 0)} left)
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ─── Top products ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-gray-900">
                Top Products
              </h2>

              {topProducts.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  No product sales yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((item) => (
                    <TopItemRow key={item.itemId} item={item} isProduct />
                  ))}
                </div>
              )}
            </section>

            {/* ─── Top food packs ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-gray-900">
                Top Food Packs
              </h2>

              {topFoodPacks.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  No food pack sales yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topFoodPacks.map((item) => (
                    <TopItemRow key={item.itemId} item={item} isProduct={false} />
                  ))}
                </div>
              )}
            </section>

            {/*
              "Recent Activity" USED TO BE HERE.
              It was three hardcoded rows — "New customer registered, 2hr
              ago", "Referral payout approved, 15m ago", "Order #DF-899
              delivered, 1hr ago" — and there is no endpoint behind any of
              them. DELETE this comment when an activity feed ships.
            */}
            <div className="flex gap-2 rounded-2xl bg-white/60 p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-[11px] text-gray-500">
                Everything on this page comes from the dashboard overview
                endpoint and the stock it reports.
              </p>
            </div>
          </>
        )}
      </main>

      <button
        type="button"
        onClick={() => navigate('/admin/orders')}
        className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus size={16} strokeWidth={2.5} />
        Quick Create
      </button>

      <AdminBottomNav />

      {menuOpen && <AdminDrawer onClose={() => setMenuOpen(false)} />}
    </div>
  );
}