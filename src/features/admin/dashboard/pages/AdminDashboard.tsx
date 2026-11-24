import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Clock,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import AdminBottomNav from '../../../../app/layouts/admin/AdminBottomNav';
import AdminDrawer from '../../../../app/layouts/admin/AdminDrawer';
import Logo from '../../../../components/ui/Logo';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import { usePendingPayouts } from '../../referrals/payoutQueries';
import RevenueCard from '../components/RevenueCard';
import TopItems from '../components/TopItems';
import { useAdminDashboardOverview } from '../queries';

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const overviewQuery = useAdminDashboardOverview();
  const pendingPayoutsQuery = usePendingPayouts();

  const hasPendingPayouts =
    (pendingPayoutsQuery.data?.payoutRequests?.length ?? 0) > 0;

  const data = overviewQuery.data;
  const revenue = data?.revenueInsight;
  const peak = data?.peakHours;
  const lowStock = data?.lowStockAlerts ?? [];
  const topProducts = data?.topProducts ?? [];
  const topFoodPacks = data?.topFoodPacks ?? [];

  const refreshing = overviewQuery.isFetching || pendingPayoutsQuery.isFetching;

  const handleRefresh = () => {
    overviewQuery.refetch();
    pendingPayoutsQuery.refetch();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-between px-5 pt-6">
        <Logo className="h-10 w-auto" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? 'animate-spin' : ''}
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

        {/* ─── Action Required ─── */}
        {hasPendingPayouts && (
          <section>
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-gray-400">
              ACTION REQUIRED
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/queue')}
              className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle size={16} strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">
                  Payout requests awaiting approval
                </p>
                <p className="text-xs text-amber-600">
                  Review and action pending withdrawal requests
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-amber-400" />
            </button>
          </section>
        )}

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

        {data && (
          <>
            {revenue && <RevenueCard revenue={revenue} />}

            {/* ─── Peak hours ─── */}
            {peak && (
              <div className="rounded-2xl bg-gray-900 p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock size={16} strokeWidth={2} />
                  Peak Hours
                </div>
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

            <TopItems kind="products" items={topProducts} />
            <TopItems kind="food-packs" items={topFoodPacks} />
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
