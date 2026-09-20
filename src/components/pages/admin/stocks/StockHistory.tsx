import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  History,
  Info,
  X,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import {
  useStockHistory,
  useStockHistoryRecord,
} from '../../../../app/hooks/useAdminStockHistory';
import type { StockHistoryRecord } from '../../../../app/lib/adminStockApi';

/*
|==========================================================================
| ADMIN → STOCK HISTORY   /admin/stocks
|==========================================================================
|
| The stock ledger: every change to product stock, who made it and when.
|
|   GET /api/v1/admin/stocks/history
|   GET /api/v1/admin/stocks/history/:recordId
|   GET /api/v1/admin/stocks/product/:productId/history
|
| Why this is new: all three endpoints were documented and all three exist on
| the live server (401, not `Cannot GET`), and `adminStockApi.ts` already
| wrapped them — but nothing ever called it. The file had been sitting unused.
|
| ── READ THIS BEFORE EDITING THE FIELDS BELOW ────────────────────────────
| ⚠️ NONE of the three has a saved response in the collection, so the field
|    names are genuinely unknown. Every record is pushed through
|    `toStockRecord()` in adminStockApi.ts, which probes several plausible
|    spellings per field — `quantityChanged` / `delta` / `changeAmount` for the
|    delta, `createdAt` / `timestamp` / `changedAt` for the time, and so on.
|
| The screen therefore renders real data whichever way the backend named
| things, and shows a dash rather than a blank cell when a field is simply not
| in the payload. If something looks empty that should not, the fix is to add
| the backend's spelling to the key list in `toStockRecord` — not here.
|
| ── THE MAGNITUDE BAR ────────────────────────────────────────────────────
| Bar width shows how big a change was relative to the largest on the page, so
| a +200 restock reads as bigger than a -3 correction. It is presentational:
| the signed number beside it is the actual value.
*/

/** Relative time for the ledger, falling back to the date for old entries. */
function whenLabel(iso: string | null): string {
  if (!iso) return '—';

  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '—';

  const diffMs = Date.now() - then.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return then.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Signed, coloured change label. `null` change renders as a dash. */
function ChangeBadge({ record }: { record: StockHistoryRecord }) {
  const { change, operation } = record;

  /*
    Prefer the explicit delta. When only the resulting quantity was sent there
    is no way to know the direction, so nothing is invented — `operation` alone
    drives the icon and the number is shown unsigned.
  */
  const hasChange = change !== null && change !== undefined;
  const isDown = hasChange
    ? Number(change) < 0
    : operation === 'decrement';

  const Icon =
    operation === 'set' || operation === null
      ? SlidersHorizontal
      : isDown
        ? ArrowDownCircle
        : ArrowUpCircle;

  const tone = isDown ? 'text-red-500' : 'text-primary';

  return (
    <span className={`flex items-center gap-1 text-sm font-bold ${tone}`}>
      <Icon size={14} />
      {hasChange
        ? `${Number(change) > 0 ? '+' : ''}${Number(change)}`
        : '—'}
    </span>
  );
}

export default function StockHistory() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const historyQuery = useStockHistory({ page, limit: 20 });
  const records = historyQuery.data?.records ?? [];
  const pagination = historyQuery.data?.pagination;

  /*
    Largest absolute change on this page, for scaling the bars. Guarded with
    Math.max(1, …) so a page of all-zeros does not divide by zero.
  */
  const maxMagnitude = Math.max(
    1,
    ...records.map((r) => Math.abs(Number(r.change ?? r.quantity ?? 0)))
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          aria-label="Back to dashboard"
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Stock History</h1>
        <button
          type="button"
          onClick={() => historyQuery.refetch()}
          disabled={historyQuery.isFetching}
          aria-label="Refresh"
          className="text-primary-dark disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={historyQuery.isFetching ? 'animate-spin' : ''}
          />
        </button>
      </header>

      <main className="flex-1 px-5 pb-32 pt-5">
        {/* ─── Loading ─── */}
        {historyQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading stock history…</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {historyQuery.isError && !historyQuery.isLoading && (
          <div className="rounded-2xl bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                historyQuery.error,
                'Could not load stock history.'
              )}
            </p>
            <button
              type="button"
              onClick={() => historyQuery.refetch()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* ─── Empty ─── */}
        {!historyQuery.isLoading && !historyQuery.isError && records.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <History size={34} className="text-gray-300" />
            <p className="text-sm text-gray-500">No stock changes recorded yet.</p>
            <p className="max-w-xs text-xs text-gray-400">
              Every stock adjustment made from a product page appears here.
            </p>
          </div>
        )}

        {/* ─── Ledger ─── */}
        {!historyQuery.isLoading && !historyQuery.isError && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record, index) => {
              /*
                The record id is the React key, but the normaliser returns ''
                when the payload has no recognisable id — hence the index
                fallback, which is safe here because the list is not reordered.
              */
              const key = record.id || `row-${index}`;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => record.id && setDetailId(record.id)}
                  disabled={!record.id}
                  className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 disabled:cursor-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {record.productName ?? 'Unnamed product'}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {whenLabel(record.createdAt)}
                        {record.actor ? ` · ${record.actor}` : ''}
                      </p>
                    </div>

                    <ChangeBadge record={record} />
                  </div>

                  {/* Resulting quantity, only when the payload sent one. */}
                  {record.quantity !== null && record.quantity !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      Now at {Number(record.quantity)} in stock
                    </p>
                  )}

                  {record.reason && (
                    <p className="mt-1 text-xs text-gray-500">{record.reason}</p>
                  )}

                  {/* Bar scaled against the biggest change on this page. */}
                  {record.change !== null && record.change !== undefined && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className={
                          'h-1.5 rounded-full ' +
                          (Number(record.change) < 0 ? 'bg-red-400' : 'bg-primary')
                        }
                        style={{
                          width: `${Math.min(
                            100,
                            (Math.abs(Number(record.change)) / maxMagnitude) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Paging ─── */}
        {pagination && (pagination.hasPreviousPage || pagination.hasNextPage) && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-xs text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {/* ─── Caveat ─── */}
        {!historyQuery.isLoading && records.length > 0 && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-gray-50 p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] text-gray-500">
              Tap a row for the full record. A dash means the response did not
              include that value.
            </p>
          </div>
        )}
      </main>

      {detailId && (
        <RecordDetail recordId={detailId} onClose={() => setDetailId(null)} />
      )}

      <AdminBottomNav />
    </div>
  );
}

/* =========================================================================
 * Single record — GET /api/v1/admin/stocks/history/:recordId
 * ========================================================================= */

function RecordDetail({
  recordId,
  onClose,
}: {
  recordId: string;
  onClose: () => void;
}) {
  const recordQuery = useStockHistoryRecord(recordId);
  const record = recordQuery.data;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div className="relative z-10 max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Stock Change</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {recordQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 size={22} className="animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading record…</p>
          </div>
        )}

        {recordQuery.isError && !recordQuery.isLoading && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {getApiErrorMessage(recordQuery.error, 'Could not load that record.')}
          </p>
        )}

        {record && (
          <>
            {/*
              The mapped fields first, then the RAW payload underneath. Because
              the shape is undocumented, showing the untouched object means an
              admin — or the dev reading a screenshot — can see anything the
              normaliser did not recognise, instead of it being silently lost.
            */}
            <dl className="space-y-3">
              {(
                [
                  ['Product', record.productName],
                  ['Product ID', record.productId],
                  ['Change', record.change === null ? null : String(record.change)],
                  ['Resulting quantity', record.quantity === null ? null : String(record.quantity)],
                  ['Operation', record.operation],
                  ['Reason', record.reason],
                  ['By', record.actor],
                  ['When', record.createdAt],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="max-w-[60%] break-words text-right text-sm font-medium text-gray-900">
                    {value === null || value === undefined || value === ''
                      ? '—'
                      : value}
                  </dd>
                </div>
              ))}
            </dl>

            <details className="mt-5">
              <summary className="cursor-pointer text-xs font-semibold text-gray-500">
                Raw response
              </summary>
              <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-gray-50 p-3 text-[10px] leading-relaxed text-gray-600">
                {JSON.stringify(record.raw, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}