import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  adminStockApi,
  toStockHistory,
  type StockHistoryPagination,
  type StockHistoryRecord,
} from '../lib/adminStockApi';
import { queryKeys } from '../lib/query-client';


export type StockHistoryPage = {
  records: StockHistoryRecord[];
  pagination: StockHistoryPagination | null;
};

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


export function useStockHistoryRecord(
  recordId?: string
): UseQueryResult<StockHistoryRecord | null, Error> {
  return useQuery<StockHistoryRecord | null, Error>({
    queryKey: queryKeys.adminStockHistoryRecord(recordId ?? ''),
    queryFn: async () => {
      const res = await adminStockApi.getHistoryById(recordId as string);
      const data = res.data.data;
      if (!data) return null;

      const bag = data as Record<string, unknown>;
      let row = bag.record ?? bag.history ?? bag.data ?? bag;

   
      if (Array.isArray(row)) row = row[0];

      if (!row || typeof row !== 'object') return null;

      return toStockHistory({ history: [row] }).records[0] ?? null;
    },
    enabled: Boolean(recordId),
  });
}

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