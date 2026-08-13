import api from './axios';

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  scale: string;
  quantity: number;
  createdAt: string;
  imageUrls: string[];
  category: ProductCategory;
  discount: null | Record<string, any>;
  // only on single product — may not exist on list
  rating?: number;
  reviewCount?: number;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductFilters {
  maxPrice?: number;
  minPrice?: number;
  sortOrder?: 'asc' | 'desc';
  sortBy?: 'rating' | 'price';
  limit?: number;
  page?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface ReviewPayload {
  star: number;
  comment: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const productApi = {
  getProducts: (filters?: ProductFilters) =>
    api.get<ApiResponse<{ products: ApiProduct[]; pagination: Pagination }>>(
      '/api/v1/products',
      { params: filters }
    ),

  getCategories: () =>
    api.get<ApiResponse<{ productCategories: ProductCategory[] }>>(
      '/api/v1/products/categories'
    ),

  getEssentials: () =>
    api.get<ApiResponse<{ products: ApiProduct[] }>>(
      '/api/v1/products/essentials'
    ),

  getPreviouslyPurchased: () =>
    api.get<ApiResponse<{ products: ApiProduct[] }>>(
      '/api/v1/products/previously-purchased'
    ),

  getProductById: (productId: string) =>
    api.get<ApiResponse<{ product: ApiProduct }>>(
      `/api/v1/products/${productId}`
    ),

  getRelatedProducts: (id: string) =>
    api.get<ApiResponse<{ products: ApiProduct[] }>>(
      `/api/v1/products/${id}/related-products`
    ),

  reviewProduct: (id: string, data: ReviewPayload) =>
    api.post(`/api/v1/products/${id}/reviews`, data),
};