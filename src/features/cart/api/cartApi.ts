import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';

interface Discount {
  id: string;
  discountPrice: number;
  discountValue: number;
  isPermanent: boolean;
  discountType: string;
  isExpired: boolean;
  originalPrice: string | boolean;
}

export interface CartItem {
  id: string;
  itemName: string;
  itemCategoryName: string;
  itemId: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  acceptPaymentOnDelivery: boolean;
  itemUrls: string[];
  itemPrice: string;
  quantity: number;
  discount?: Discount | null;
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

export const cartApi = {
  getCart: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ cart: Cart }>>('/api/v1/cart', { signal }),

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
