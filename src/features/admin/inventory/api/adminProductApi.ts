import { refreshAfterInventoryWrite } from '../cache';
import api from '../../../../app/lib/axios';

export interface AdminProductCategory {
  id: string;
  name: string;
  productsCount?: number | undefined;
}

export interface AdminProductDiscount {
  id: string;
  discountValue: number;
  discountType: string;
  isPermanent: boolean;
  isExpired: boolean;
  originalPrice: string;
  discountPrice: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  scale: string;
  sku: string;
  acceptPaymentOnDelivery: boolean;
  isHidden: boolean;
  stock_status: 'AVAILABLE' | 'OUT_OF_STOCK' | string;
  quantity: number;
  createdAt: string;
  imageUrls: string[];
  category: AdminProductCategory;
  discount: AdminProductDiscount | null;
  total_orders?: number;
  total_revenue?: number;
}

export interface AdminPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminProductFilters {
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  sortBy?: string;
  limit?: number;
  page?: number;
  status?: string;
  /**
   * One or more category IDs.
   * Serialized as repeated params: category=id1&category=id2
   * to match the backend's expectation.
   */
  category?: string[];
  search?: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  quantity: number;
  acceptPaymentOnDelivery: boolean;
  scale: string;
  categoryId: string;
  imageUrls: string[];
  featuredProduct?: boolean;
  visibleToCustomers?: boolean;
  discount?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  scale?: string;
  acceptPaymentOnDelivery?: boolean;
  imageUrls?: string[];
  discount?: number;
  categoryId?: string;
}

export interface StockUpdatePayload {
  quantity: number;
  operation: 'INCREMENT' | 'DECREMENT';
}

export interface UpdateProductPricePayload {
  currentPrice: number;
  newPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

/**
 * Serializes params so that array values are repeated:
 *   { category: ['a', 'b'] } → "category=a&category=b"
 *
 * Axios's default serializer produces "category[]=a&category[]=b" which
 * NestJS's @Query() decorator does not parse as an array.
 */
function serializeParams(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

export const adminProductApi = {
  createProduct: (data: CreateProductPayload) =>
    refreshAfterInventoryWrite(api.post<ApiResponse<{ product?: AdminProduct }>>('/api/v1/admin/products', data)),

  getProducts: (filters?: AdminProductFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{ products: AdminProduct[]; pagination: AdminPagination }>>(
      '/api/v1/admin/products',
      {
        params: filters,
        signal,
        paramsSerializer: { serialize: serializeParams },
      }
    ),

  getProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(`/api/v1/admin/products/${id}`),

  updateProduct: (id: string, data: UpdateProductPayload) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<{ product?: AdminProduct }>>(`/api/v1/admin/products/${id}`, data)),

  hideProduct: (id: string) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/hide`)),

  unhideProduct: (id: string) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/unhide`)),

  getHiddenProducts: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ products: AdminProduct[] }>>(
      '/api/v1/admin/products/visibility/hidden',
      { signal },
    ),

  getHiddenProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(
      `/api/v1/admin/products/visibilty/hidden/${id}`
    ),

  updateStock: (id: string, data: StockUpdatePayload) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/stock`, data)),

  updateProductPrice: (id: string, data: UpdateProductPricePayload) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/price/update`, data)),
};
