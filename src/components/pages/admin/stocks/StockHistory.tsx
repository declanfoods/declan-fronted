import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  History,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import {
  adminStockApi,
  type ProductStockHistory,
  type StockHistoryPagination,
} from '../../../../app/lib/adminStockApi';

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-NG', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('en-NG', {
    hour:   '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins   = Math.floor(diffMs / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days  = Math.floor(hours / 24);
  if (days < 7)   return `${days}d ago`;
  return formatDate(date);
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

function RecordDetailSheet({
  record,
  onClose,
}: {
  record: ProductStockHistory;
  onClose: () => void;
}) {
  const isIncrement = record.operationType === 'increment';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full rounded-t-3xl bg-white pb-10">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-base font-bold text-gray-900">Stock Change Detail</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5">
          {/* Operation banner */}
          <div
            className={`flex items-center gap-3 rounded-2xl p-4 ${
              isIncrement ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isIncrement ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isIncrement ? (
                <TrendingUp size={20} className="text-green-600" />
              ) : (
                <TrendingDown size={20} className="text-red-500" />
              )}
            </div>
            <div>
              <p className={`text-lg font-extrabold ${isIncrement ? 'text-green-700' : 'text-red-600'}`}>
                {isIncrement ? '+' : '−'}{record.quantity} units
              </p>
              <p className={`text-xs font-semibold uppercase ${isIncrement ? 'text-green-600' : 'text-red-500'}`}>
                {isIncrement ? 'Stock In' : 'Stock Out'}
              </p>
            </div>
          </div>

          {/* Stock movement */}
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Stock Movement
            </p>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xl font-extrabold text-gray-800">
                  {record.quantityBeforeOperation}
                </p>
                <p className="text-[10px] text-gray-400">Before</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <p className={`text-xs font-bold ${isIncrement ? 'text-green-600' : 'text-red-500'}`}>
                {isIncrement ? '+' : '−'}{record.quantity}
              </p>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <div className="text-center">
                <p className="text-xl font-extrabold text-gray-800">
                  {record.quantityAfterOperation}
                </p>
                <p className="text-[10px] text-gray-400">After</p>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Product
            </p>
            <div className="flex items-center gap-3">
              {record.product.imageUrls?.[0] ? (
                <img
                  src={record.product.imageUrls[0]}
                  alt={record.product.name}
                  className="h-11 w-11 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-200">
                  <Package size={18} className="text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {record.product.name}
                </p>
                <p className="text-xs text-gray-400">
                  SKU: {record.product.sku} · {record.product.category?.name}
                </p>
                <p className="text-xs text-gray-400">
                  ₦{Number(record.product.price).toLocaleString()} / {record.product.scale}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">When</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(record.createdAt)} · {formatTime(record.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StockHistoryPage() {
  const navigate = useNavigate();

  const [page, setPage]               = useState(1);
  const [records, setRecords]         = useState<ProductStockHistory[]>([]);
  const [pagination, setPagination]   = useState<StockHistoryPagination | null>(null);
  const [loading, setLoading]         = useState(true);
  const [fetching, setFetching]       = useState(false);
  const [error, setError]             = useState('');
  const [selected, setSelected]       = useState<ProductStockHistory | null>(null);

  const fetchHistory = async (targetPage: number) => {
    targetPage === 1 ? setLoading(true) : setFetching(true);
    setError('');
    try {
      const res = await adminStockApi.getAllHistory({ page: targetPage, limit: PAGE_SIZE });
      setRecords(res.data.data.stockHistory);
      setPagination(res.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load stock history.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  // Initial load
  useState(() => { fetchHistory(1); });

  const handlePageChange = (next: number) => {
    setPage(next);
    fetchHistory(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Summary stats for current page
  const totalAdded   = records.filter((r) => r.operationType === 'increment').reduce((s, r) => s + r.quantity, 0);
  const totalRemoved = records.filter((r) => r.operationType === 'decrement').reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Stock History</h1>
        <button
          type="button"
          onClick={() => fetchHistory(page)}
          disabled={loading || fetching}
          className="text-primary-dark disabled:opacity-40"
        >
          <RefreshCw size={18} className={fetching ? 'animate-spin' : ''} />
        </button>
      </header>

      <main className="flex-1 px-5 pb-32 pt-5">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Loading stock history…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchHistory(page)}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && records.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <History size={36} className="text-gray-300" />
            <p className="text-sm text-gray-500">No stock changes recorded yet.</p>
            <p className="text-xs text-gray-400">
              Every stock adjustment made from a product page will appear here.
            </p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <>
            {/* Page summary */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center rounded-2xl bg-green-50 py-3">
                <p className="text-xl font-extrabold text-green-700">+{totalAdded}</p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">Added this page</p>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-red-50 py-3">
                <p className="text-xl font-extrabold text-red-600">−{totalRemoved}</p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">Removed this page</p>
              </div>
            </div>

            {/* Ledger */}
            <div className="space-y-3">
              {records.map((record) => {
                const isIncrement = record.operationType === 'increment';

                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => setSelected(record)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-gray-100 p-4 text-left shadow-sm transition-colors hover:border-primary/20 hover:bg-gray-50"
                  >
                    {/* Product image with op badge */}
                    <div className="relative mt-0.5 shrink-0">
                      {record.product.imageUrls?.[0] ? (
                        <img
                          src={record.product.imageUrls[0]}
                          alt={record.product.name}
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                      {/* Op badge */}
                      <div
                        className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
                          isIncrement ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {isIncrement ? (
                          <TrendingUp size={9} className="text-white" />
                        ) : (
                          <TrendingDown size={9} className="text-white" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {record.product.name}
                        </p>
                        <span
                          className={`shrink-0 text-sm font-extrabold ${
                            isIncrement ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {isIncrement ? '+' : '−'}{record.quantity}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {record.product.category?.name} · SKU {record.product.sku}
                      </p>

                      {/* Before → After */}
                      <p className="mt-1 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">
                          {record.quantityBeforeOperation}
                        </span>
                        {' → '}
                        <span className="font-semibold text-gray-700">
                          {record.quantityAfterOperation}
                        </span>
                        {' units'}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {relativeTime(record.createdAt)} · {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || fetching}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                  Prev
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
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <RecordDetailSheet
          record={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <AdminBottomNav />
    </div>
  );
}