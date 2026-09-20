import api from './axios';
import type { ApiResponse } from './api-types';

export interface StockHistoryFilters {
  limit?: number;
  page?: number;
}

export interface StockHistoryPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/*
|--------------------------------------------------------------------------
| Stock history records
|--------------------------------------------------------------------------
| ⚠️ STILL UNDOCUMENTED. None of the three stock history endpoints
|    (/history, /history/:recordId, /product/:productId/history) has a saved
|    response in the collection, so the exact field names are unknown.
|
| All three DO exist on the live server — probed, 401 rather than a
| `Cannot GET` 404.
|
| Rather than guess one shape and break on a near miss, the record is kept
| loose and read through `toStockRecord()` below, which accepts several
| plausible spellings for each field. That way the screen renders real data
| whichever way the backend named things, and it degrades to placeholders
| rather than blanks if a field is simply absent.
|
| Tell the backend dev: a saved 200 on each route would let all of this
| defensiveness go away.
*/
export interface StockHistoryRecord {
  id: string;
  /** ISO timestamp of the change. */
  createdAt: string | null;
  /** The product the change belongs to, when the payload identifies it. */
  productId: string | null;
  productName: string | null;
  /**
   * Signed delta if the payload carries one, otherwise null and the UI falls
   * back to `quantity`.
   */
  change: number | null;
  /** Resulting quantity after the change, if sent. */
  quantity: number | null;
  /** Whatever the server called the operation, normalised where possible. */
  operation: 'increment' | 'decrement' | 'set' | null;
  /** Free-text reason, if the payload has one. */
  reason: string | null;
  /** Who did it, if the payload has one. */
  actor: string | null;
  /** The untouched row, so a details view can show anything not mapped. */
  raw: Record<string, unknown>;
}

function firstOf<T>(bag: Record<string, unknown>, keys: string[]): T | null {
  for (const key of keys) {
    const value = bag[key];
    if (value !== undefined && value !== null && value !== '') {
      return value as T;
    }
  }
  return null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalises one history record.
 *
 * Deliberately forgiving: every field is optional in the API's own terms, so
 * each is probed under the names a backend is most likely to have used
 * (`quantityChanged`/`delta`/`changeAmount`, and so on) before giving up.
 */
export function toStockRecord(raw: Record<string, unknown>): StockHistoryRecord {
  const operationRaw = String(
    firstOf<string>(raw, ['operation', 'operationType', 'type', 'action', 'changeType']) ?? ''
  ).toLowerCase();

  /*
    'INCREMENT' / 'DECREMENT' are what the stock-update body uses, so those are
    the words to expect — but `added`/`removed` and `+`/`-` variants are folded
    in too, because guessing wrong here is what would put a decrease on screen
    as an increase.
  */
  let operation: StockHistoryRecord['operation'] = null;
  if (operationRaw.includes('increment') || operationRaw.includes('add') || operationRaw === '+') {
    operation = 'increment';
  } else if (
    operationRaw.includes('decrement') ||
    operationRaw.includes('remov') ||
    operationRaw.includes('subtract') ||
    operationRaw === '-'
  ) {
    operation = 'decrement';
  } else if (operationRaw.includes('set') || operationRaw.includes('update')) {
    operation = 'set';
  }

  return {
    id: String(firstOf<string>(raw, ['id', 'recordId', '_id', 'historyId']) ?? ''),
    createdAt: firstOf<string>(raw, ['createdAt', 'timestamp', 'date', 'changedAt', 'updatedAt']),
    productId: firstOf<string>(raw, ['productId', 'itemId', 'product_id']),
    productName: firstOf<string>(raw, [
      'productName',
      'name',
      'itemName',
      'productTitle',
    ]),
    change: toNumberOrNull(
      firstOf<unknown>(raw, [
        'quantityChanged',
        'change',
        'delta',
        'changeAmount',
        'difference',
        'adjustment',
      ])
    ),
    quantity: toNumberOrNull(
      firstOf<unknown>(raw, [
        'quantity',
        'newQuantity',
        'quantityAfter',
        'currentQuantity',
        'stock',
        'quantityLeft',
      ])
    ),
    operation,
    reason: firstOf<string>(raw, ['reason', 'note', 'remarks', 'description', 'comment']),
    actor: firstOf<string>(raw, [
      'performedBy',
      'actor',
      'adminName',
      'userName',
      'updatedBy',
      'createdBy',
    ]),
    raw,
  };
}

/** Normalises a list, tolerating either envelope. */
export function toStockHistory(data: unknown): {
  records: StockHistoryRecord[];
  pagination: StockHistoryPagination | null;
} {
  if (!data) return { records: [], pagination: null };

  if (Array.isArray(data)) {
    return {
      records: data.map((r) => toStockRecord(r as Record<string, unknown>)),
      pagination: null,
    };
  }

  const bag = data as Record<string, unknown>;
  const list = bag.history ?? bag.records ?? bag.stockHistory ?? bag.data ?? [];

  return {
    records: Array.isArray(list)
      ? list.map((r) => toStockRecord(r as Record<string, unknown>))
      : [],
    pagination: (bag.pagination as StockHistoryPagination) ?? null,
  };
}

/*
  The local ApiResponse redeclaration that used to sit here is gone — this
  file now imports the shared one from api-types.ts like everything else.
*/

export const adminStockApi = {
  getAllHistory: (filters?: StockHistoryFilters) =>
    api.get<ApiResponse<unknown>>(
      '/api/v1/admin/stocks/history',
      { params: filters }
    ),

  getHistoryById: (recordId: string) =>
    api.get<ApiResponse<unknown>>(
      `/api/v1/admin/stocks/history/${recordId}`
    ),

  getProductHistory: (productId: string, filters?: StockHistoryFilters) =>
    api.get<ApiResponse<unknown>>(
      `/api/v1/admin/stocks/product/${productId}/history`,
      { params: filters }
    ),
};