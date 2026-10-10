import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { adminGeneralDiscountApi as adminDiscountApi, type GeneralDiscount } from '../../../../app/lib/adminGeneralDiscountApi';
import { AdminDiscountToggleActiveSheet } from './components/AdminDiscountToggle';
import { AdminDiscountSheet } from './components/AdminGeneralDiscountSheet';


const PAGE_SIZE = 10;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-NG', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

function isExpired(date: Date | string) {
  return new Date(date).getTime() < Date.now();
}

function discountStatus(discount: GeneralDiscount): 'active' | 'inactive' | 'expired' {
  if (isExpired(discount.expiresAt)) return 'expired';
  if (!discount.isActive)            return 'inactive';
  return 'active';
}

const statusConfig = {
  active:   { label: 'Active',   bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  inactive: { label: 'Inactive', bg: 'bg-gray-100',   text: 'text-gray-500',   icon: XCircle      },
  expired:  { label: 'Expired',  bg: 'bg-red-100',    text: 'text-red-600',    icon: Clock        },
};


export default function AdminGeneralDiscounts() {
  const navigate = useNavigate();

  const [discounts,  setDiscounts]  = useState<GeneralDiscount[]>([]);
  const [pagination, setPagination] = useState<{ totalPages: number; currentPage: number; hasNextPage: boolean; hasPreviousPage: boolean } | null>(null);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [fetching,   setFetching]   = useState(false);
  const [error,      setError]      = useState('');

  const [sheetOpen,    setSheetOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<GeneralDiscount | null>(null);
  const [toggleTarget, setToggleTarget] = useState<GeneralDiscount | null>(null);

  const activeDiscount = discounts.find(
    (d) => d.isActive && !isExpired(d.expiresAt)
  ) ?? null;

  const fetchDiscounts = useCallback(async (targetPage: number) => {
    targetPage === 1 ? setLoading(true) : setFetching(true);
    setError('');
    try {
      const res = await adminDiscountApi.getDiscounts({ page: targetPage, limit: PAGE_SIZE });
      setDiscounts(res.data.data.discounts);
      setPagination(res.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load discounts.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchDiscounts(1); }, [fetchDiscounts]);

  const handlePageChange = (next: number) => {
    setPage(next);
    fetchDiscounts(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // After create or edit, refresh list from page 1
  const handleSaved = () => {
    setSheetOpen(false);
    setEditTarget(null);
    setPage(1);
    fetchDiscounts(1);
  };

  const handleToggled = (updated: GeneralDiscount) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setToggleTarget(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">General Discounts</h1>
        <button
          type="button"
          onClick={() => fetchDiscounts(page)}
          disabled={loading || fetching}
          className="text-primary-dark disabled:opacity-40"
        >
          <RefreshCw size={18} className={fetching ? 'animate-spin' : ''} />
        </button>
      </header>

      <main className="flex-1 px-5 pb-32 pt-5">
        {/* Active discount banner */}
        {activeDiscount && (
          <div className="mb-5 rounded-2xl bg-primary px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Active Discount
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-white">
                  {activeDiscount.percentageOff}% OFF
                </p>
                <p className="text-sm font-medium text-white/80">{activeDiscount.title}</p>
              </div>
              <Tag size={28} className="shrink-0 text-white/30" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-white/60">
                Expires {formatDate(activeDiscount.expiresAt)}
              </p>
              {activeDiscount.overrideProductDiscount && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                  Overrides product discounts
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Loading discounts…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchDiscounts(page)}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && discounts.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Tag size={36} className="text-gray-300" />
            <p className="text-sm text-gray-500">No discounts created yet.</p>
            <p className="text-xs text-gray-400">
              Create a general discount to apply a percentage off all products.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && discounts.length > 0 && (
          <div className="space-y-3">
            {discounts.map((discount) => {
              const status = discountStatus(discount);
              const cfg    = statusConfig[status];
              const Icon   = cfg.icon;

              return (
                <div
                  key={discount.id}
                  className="rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {discount.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Created {formatDate(discount.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}
                    >
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-baseline gap-1 rounded-xl bg-primary/5 px-3 py-2">
                      <p className="text-xl font-extrabold text-primary">
                        {discount.percentageOff}
                      </p>
                      <p className="text-xs font-bold text-primary">% OFF</p>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Expires:</span>{' '}
                        {formatDate(discount.expiresAt)}
                        {isExpired(discount.expiresAt) && (
                          <span className="ml-1 text-red-500">(expired)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Override:</span>{' '}
                        {discount.overrideProductDiscount ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => { setEditTarget(discount); setSheetOpen(true); }}
                      className="flex-1 rounded-full border border-gray-200 py-2 text-xs font-semibold text-gray-600"
                    >
                      Edit
                    </button>
                    {status !== 'expired' && (
                      <button
                        type="button"
                        onClick={() => setToggleTarget(discount)}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold ${
                          discount.isActive
                            ? 'bg-red-50 text-red-600'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || fetching}
              onClick={() => handlePageChange(page - 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <span className="text-sm text-gray-400">
              <span className="font-semibold text-gray-700">{pagination.currentPage}</span>
              {' / '}
              <span className="font-semibold text-gray-700">{pagination.totalPages}</span>
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage || fetching}
              onClick={() => handlePageChange(page + 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        type="button"
        onClick={() => { setEditTarget(null); setSheetOpen(true); }}
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        aria-label="New discount"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <AdminBottomNav />

      {sheetOpen && (
        <AdminDiscountSheet
          editing={editTarget}
          onClose={() => { setSheetOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {toggleTarget && (
        <AdminDiscountToggleActiveSheet
          discount={toggleTarget}
          onClose={() => setToggleTarget(null)}
          onToggled={handleToggled}
        />
      )}
    </div>
  );
}