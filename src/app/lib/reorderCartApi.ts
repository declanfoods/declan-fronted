import api from './axios';

export interface ReorderCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: { id: string; url: string } | null;
}

export interface ReorderCart {
  id: string;
  items: ReorderCartItem[];
  totalPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export interface UpdateReorderQtyPayload {
  quantity: number;
  operationType: 'INCREMENT' | 'DECREMENT';
}

export const reorderCartApi = {
  getReorderCart: () =>
    api.get<ApiResponse<ReorderCart>>('/api/v1/reorder-carts'),

  updateReorderItem: (itemId: string, data: UpdateReorderQtyPayload) =>
    api.patch(`/api/v1/reorder-carts/items/${itemId}`, data),

  removeReorderItem: (itemId: string) =>
    api.delete(`/api/v1/reorder-carts/items/${itemId}`),
};