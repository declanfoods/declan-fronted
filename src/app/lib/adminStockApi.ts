import api from './axios';

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

// Exact shape isn't documented yet — kept loose with an index signature so
// the UI can defensively read whatever fields the backend actually returns.
export interface StockHistoryRecord {
  id: string;
  productId?: string;
  quantity?: number;
  operation?: 'increment' | 'decrement';
  createdAt?: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminStockApi = {
  getAllHistory: (filters?: StockHistoryFilters) =>
    api.get<ApiResponse<{ history: StockHistoryRecord[]; pagination: StockHistoryPagination }>>(
      '/api/v1/admin/stocks/history',
      { params: filters }
    ),

  getHistoryById: (recordId: string) =>
    api.get<ApiResponse<{ record: StockHistoryRecord }>>(
      `/api/v1/admin/stocks/history/${recordId}`
    ),

  getProductHistory: (productId: string, filters?: StockHistoryFilters) =>
    api.get<ApiResponse<{ history: StockHistoryRecord[]; pagination: StockHistoryPagination }>>(
      `/api/v1/admin/stocks/product/${productId}/history`,
      { params: filters }
    ),
};
