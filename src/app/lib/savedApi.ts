import api from './axios';
import type { ApiProduct } from './productApi';

export interface SavedProduct {
  id: string;
  product: ApiProduct;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const savedApi = {
  saveProduct: (productId: string) =>
    api.post('/api/v1/saved/products', { productId }),

  getSavedProducts: () =>
    api.get<ApiResponse<SavedProduct[]>>('/api/v1/saved/products'),

  removeSavedProduct: (savedItemId: string) =>
    api.delete(`/api/v1/saved/products/${savedItemId}`),
};