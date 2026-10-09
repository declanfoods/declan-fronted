// ProductStockHistory.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  adminStockApi,
  type ProductStockHistory,
  type StockHistoryPagination,
} from '../../../../app/lib/adminStockApi';

const PAGE_SIZE = 15;

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', {
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

export default function ProductStockHistory() {
  const navigate           = useNavigate();
  const { id: productId }  = useParams<{ id: string }>();

  const [history, setHistory]         = useState<ProductStockHistory[]>([]);
  const [pagination, setPagination]   = useState<StockHistoryPagination | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [page, setPage]               = useState(1);


  const productMeta = history[0]?.product ?? null;

  const fetchHistory = async (targetPage: number) => {
    if (!productId) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminStockApi.getProductHistory(productId, {
        limit: PAGE_SIZE,
        page:  targetPage,
      });
      setHistory(res.data.data.stockHistory);
      setPagination(res.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load stock history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page, productId]);

  // ── summary stats from current page ─────────────────────────────────────────
  const totalAdded   = history.filter((r) => r.operationType === 'increment').reduce((s, r) => s + r.quantity, 0);
  const totalRemoved = history.filter((r) => r.operationType === 'decrement').reduce((s, r) => s + r.quantity, 0);
  const latestStock  = history[0]?.quantityAfterOperation ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Stock History</h1>
        <div className="w-6" /> {/* spacer */}
      </header>

      {/* Product identity strip */}
      {productMeta && (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
          {productMeta.imageUrls?.[0] ? (
            <img
              src={productMeta.imageUrls[0]}
              alt={productMeta.name}
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200">
              <Package size={20} className="text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{productMeta.name}</p>
            <p className="text-xs text-gray-400">
              SKU: {productMeta.sku} · {productMeta.category?.name}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {!loading && history.length > 0 && (
        <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-[#F3F7EE] py-3">
            <p className="text-lg font-extrabold text-primary-dark">{latestStock ?? '—'}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-500">Current Stock</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-green-50 py-3">
            <p className="text-lg font-extrabold text-green-700">+{totalAdded}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-500">Added</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-red-50 py-3">
            <p className="text-lg font-extrabold text-red-600">−{totalRemoved}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-500">Removed</p>
          </div>
        </div>
      )}

      <main className="flex-1 px-5 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {loading && (
          <p className="py-12 text-center text-sm text-gray-400">Loading history...</p>
        )}

        {!loading && !error && history.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            No stock changes recorded yet.
          </p>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-3">
            {history.map((record, idx) => {
              const isIncrement = record.operationType === 'increment';

              return (
                <div
                  key={record.id}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  {/* Operation icon */}
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isIncrement ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {isIncrement ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold ${isIncrement ? 'text-green-700' : 'text-red-600'}`}>
                        {isIncrement ? '+' : '−'}{record.quantity} units
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isIncrement
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {isIncrement ? 'Stock In' : 'Stock Out'}
                      </span>
                    </div>

                    {/* Before → After */}
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{record.quantityBeforeOperation}</span>
                      {' → '}
                      <span className="font-medium text-gray-700">{record.quantityAfterOperation}</span>
                      <span className="text-gray-400"> units</span>
                    </p>

                    {/* Timestamp */}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatDate(record.createdAt)} · {formatTime(record.createdAt)}
                    </p>
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
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
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
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:opacity-30"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}