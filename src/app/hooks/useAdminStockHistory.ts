import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  adminStockApi,
  toStockHistory,
  type StockHistoryPagination,
  type StockHistoryRecord,
} from '../lib/adminStockApi';
import { queryKeys } from '../lib/query-client';

/*
|==========================================================================
| Stock history hooks
|==========================================================================
| Three documented GETs, all confirmed present on the live server:
|
|   GET /api/v1/admin/stocks/history
|   GET /api/v1/admin/stocks/history/:recordId
|   GET /api/v1/admin/stocks/product/:productId/history
|
| None was wired to a screen before — the API file existed, nothing called it.
|
| ⚠️ THE RESPONSE SHAPES ARE UNDOCUMENTED (zero saved responses on all three),
|    so every payload goes through `toStockHistory()` in adminStockApi.ts,
|    which accepts several plausible field spellings. The hooks below stay
|    thin on purpose: all the uncertainty lives in one normaliser rather than
|    being spread across three hooks and a screen.
*/

export type StockHistoryPage = {
  records: StockHistoryRecord[];
  pagination: StockHistoryPagination | null;
};

/** GET /api/v1/admin/stocks/history */
export function useStockHistory(filters?: {
  page?: number;
  limit?: number;
}): UseQueryResult<StockHistoryPage, Error> {
  return useQuery<StockHistoryPage, Error>({
    queryKey: queryKeys.adminStockHistory(filters),
    queryFn: async () => {
      const res = await adminStockApi.getAllHistory(filters);
      return toStockHistory(res.data.data);
    },
    // Paging should not blank the table while the next page loads.
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /api/v1/admin/stocks/history/:recordId
 *
 * `enabled` guards against an empty id reaching the URL — that would request
 * `/stocks/history/` and hit the list route instead, silently returning the
 * wrong thing rather than an error.
 */
export function useStockHistoryRecord(
  recordId?: string
): UseQueryResult<StockHistoryRecord | null, Error> {
  return useQuery<StockHistoryRecord | null, Error>({
    queryKey: queryKeys.adminStockHistoryRecord(recordId ?? ''),
    queryFn: async () => {
      const res = await adminStockApi.getHistoryById(recordId as string);
      const data = res.data.data;

      /*
        The single-record route might wrap the row (`{ record: {...} }`) or
        return it bare. `toStockHistory` already handles both envelopes for
        lists, so the unwrap below just picks whichever single object is there
        and hands it to the same normaliser.
      */
      if (!data) return null;

      const bag = data as Record<string, unknown>;
      let row = bag.record ?? bag.history ?? bag.data ?? bag;

      /*
        Guard against the wrap being an ARRAY. If the single-record route ever
        answers with a one-item list instead of an object, indexing straight
        into it above would read array properties as if they were fields and
        produce a record of blanks. Take the first element instead.
      */
      if (Array.isArray(row)) row = row[0];

      if (!row || typeof row !== 'object') return null;

      return toStockHistory({ history: [row] }).records[0] ?? null;
    },
    enabled: Boolean(recordId),
  });
}

/** GET /api/v1/admin/stocks/product/:productId/history */
export function useProductStockHistory(
  productId?: string,
  filters?: { page?: number; limit?: number }
): UseQueryResult<StockHistoryPage, Error> {
  return useQuery<StockHistoryPage, Error>({
    queryKey: queryKeys.adminStockProductHistory(productId ?? '', filters),
    queryFn: async () => {
      const res = await adminStockApi.getProductHistory(productId as string, filters);
      return toStockHistory(res.data.data);
    },
    enabled: Boolean(productId),
    placeholderData: keepPreviousData,
  });
}