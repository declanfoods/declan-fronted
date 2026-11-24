import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';
import type { ApiProduct } from '../api/productApi';

export interface SavedProduct {
  id: string;
  product: ApiProduct;
  createdAt?: string;
}

export const savedApi = {
  saveProduct: (productId: string) =>
    api.post<ApiResponse<unknown>>('/api/v1/saved/products', { productId }),

  getSavedProducts: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ items: SavedProduct[] } | SavedProduct[]>>('/api/v1/saved/products', { signal }),

  removeSavedProduct: (savedItemId: string) =>
    api.delete<ApiResponse<unknown>>(`/api/v1/saved/products/${savedItemId}`),
};
