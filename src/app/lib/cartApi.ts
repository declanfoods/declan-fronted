import api from './axios';

export interface CartItem {
  id: string;
  itemName: string;
  itemCategoryName: string;
  itemId: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  itemUrls: string[];
  itemPrice: string;
  quantity: number;
}

export interface Cart {
  id: string;
  cartItems: CartItem[];
  subTotal: number;
  itemCount: number;
}

export interface AddToCartPayload {
  productId?: string;
  foodpackId?: string;
  quantity: number;
}

export interface UpdateQtyPayload {
  quantity: number;
  operationType: 'INCREMENT' | 'DECREMENT';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const cartApi = {
  getCart: () =>
    api.get<ApiResponse<{ cart: Cart }>>('/api/v1/cart'),

  clearCart: () =>
    api.delete('/api/v1/cart'),

  addItem: (data: AddToCartPayload) =>
    api.post<ApiResponse<{ cart: Cart }>>('/api/v1/cart/items', data),

  updateItemQty: (itemId: string, data: UpdateQtyPayload) =>
    api.patch<ApiResponse<{ cart: Cart }>>(`/api/v1/cart/items/${itemId}`, data),

  removeItem: (itemId: string) =>
    api.delete(`/api/v1/cart/items/${itemId}`),

  mergeCart: (cartItems: { productId?: string; foodPackId?: string; quantity: number }[]) =>
    api.post('/api/v1/cart/merge', { cartItems }),
};