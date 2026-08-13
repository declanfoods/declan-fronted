import api from './axios';

export interface AdminProductCategory {
  id: string;
  name: string;
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
  sortOrder?: 'asc' | 'desc';
  sortBy?: string;
  limit?: number;
  page?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  quantity: number;
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
  imageUrls?: string[];
  discount?: number;
}

export interface StockUpdatePayload {
  quantity: number;
  operation: 'increment' | 'decrement';
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

export const adminProductApi = {
  createProduct: (data: CreateProductPayload) =>
    api.post<ApiResponse<{ product?: AdminProduct }>>('/api/v1/admin/products', data),

  getProducts: (filters?: AdminProductFilters) =>
    api.get<ApiResponse<{ products: AdminProduct[]; pagination: AdminPagination }>>(
      '/api/v1/admin/products',
      { params: filters }
    ),

  getProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(`/api/v1/admin/products/${id}`),

  updateProduct: (id: string, data: UpdateProductPayload) =>
    api.patch<ApiResponse<{ product?: AdminProduct }>>(`/api/v1/admin/products/${id}`, data),

  hideProduct: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/hide`),

  unhideProduct: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/unhide`),

  getHiddenProducts: () =>
    api.get<ApiResponse<{ products: AdminProduct[] }>>(
      '/api/v1/admin/products/visibility/hidden'
    ),

  getHiddenProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(
      `/api/v1/admin/products/visibilty/hidden/${id}`
    ),

  updateStock: (id: string, data: StockUpdatePayload) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/stock`, data),

  updateProductPrice: (id: string, data: UpdateProductPricePayload) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/price/update`, data),

  // categories
  getCategories: () =>
    api.get<ApiResponse<{ productCategories: AdminProductCategory[] }>>(
      '/api/v1/products/categories'
    ),

  createCategory: (name: string) =>
    api.post<ApiResponse<{ categoryId: string; categoryName: string }>>(
      '/api/v1/admin/products/categories',
      { name }
    ),

  updateCategory: (id: string, name: string) =>
    api.patch<ApiResponse<{ categoryId: string; categoryName: string }>>(
      `/api/v1/admin/products/categories/${id}`,
      { name }
    ),

  deleteCategory: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/api/v1/admin/products/categories/${id}`),
};