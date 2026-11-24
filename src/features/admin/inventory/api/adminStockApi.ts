import api from '../../../../app/lib/axios';
import type { ApiResponse } from '../../../../app/lib/api-types';

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


export interface ProductStockHistory {
  id: string;
  quantity: number;
  operationType: 'increment' | 'decrement';
  quantityBeforeOperation: number;
  quantityAfterOperation: number;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    scale: string;
    sku: string;
    isHidden: boolean;
    imageUrls: string[];
    category: {
      id: string;
      name: string;
    }
  }
}


export const adminStockApi = {
  getAllHistory: (filters?: StockHistoryFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{stockHistory: ProductStockHistory[], pagination: StockHistoryPagination}>>(
      '/api/v1/admin/stocks/history',
      { params: filters, signal }
    ),

  getHistoryById: (recordId: string) =>
    api.get<ApiResponse<{stockHistoryRecord: ProductStockHistory}>>(
      `/api/v1/admin/stocks/history/${recordId}`
    ),

  getProductHistory: (productId: string, filters?: StockHistoryFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{stockHistory: ProductStockHistory[], pagination: StockHistoryPagination}>>(
      `/api/v1/admin/stocks/product/${productId}/history`,
      { params: filters, signal }
    ),
};
