import api from '../../../app/lib/axios';
import type { ApiPagination, ApiResponse } from '../../../app/lib/api-types';

export interface ProductCategory {
  id: string;
  name: string;
  productsCount: number;
}

export interface ProductDiscount {
  id: string;
  discountPrice: number;
  discountValue: number;
  isPermanent: boolean;
  discountType: string;
  isExpired: boolean;
  originalPrice: string | boolean;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  scale: string;
  quantity: number;
  createdAt: string;
  acceptPaymentOnDelivery: boolean;
  imageUrls: string[];
  category: ProductCategory;
  discount: ProductDiscount | null;
  // only on single product — may not exist on list
  rating?: number;
  reviewCount?: number;
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

export const productApi = {
  getProducts: (filters?: ProductFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{ products: ApiProduct[]; pagination: ApiPagination }>>(
      '/api/v1/products',
      { params: filters, signal }
    ),

  getCategories: () =>
    api.get<ApiResponse<{ productCategories: ProductCategory[] }>>(
      '/api/v1/products/categories'
    ),

  getEssentials: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ products: ApiProduct[] }>>('/api/v1/products/essentials', { signal }),

  getPreviouslyPurchased: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ products: ApiProduct[] }>>('/api/v1/products/previously-purchased', { signal }),

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
