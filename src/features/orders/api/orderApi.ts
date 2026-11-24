import type { ApiPagination, ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';

export interface OrderTimelineEvent {
  label: string;
  passed: boolean;
  passedAt: string | null;
}

export interface OrderItem {
  id: string;
  itemName: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  quantity: number;
  acceptPaymentOnDelivery: boolean;
  unitPrice: number;
  itemId: string;
  imageUrls?: string[];
}

export interface OrderDelivery {
  deliveryPrice: number;
  deliveryAddressLine: string;
  deliveryCode: string;
  deliveryInstruction: string;
  deliveryStartTime: string | null;
  deliveryEndTime: string | null;
}

export interface OrderPayment {
  id: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentMethodDescription?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  deliveryPrice: number;
  priceOfItems: number;
  numberOfItems: number;
  totalQuantityOfItems: number;
  estimatedDeliveryTime: string | Date | null;
  orderStatus: string;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
  isGuestOrder: boolean;
  customerFullname: string;
  customerEmail: string;
  customerPhoneNumber: string;
  delivery: OrderDelivery | null;
  payment: OrderPayment | null;
  rider: Record<string, unknown> | null;
  orderTimeline: OrderTimelineEvent[] | null;
}

export interface OrderDetailsPayload {
  order: Order;
  orderTimeline?: OrderTimelineEvent[] | null;
}

interface CreateOrderPayload {
  payment: { paymentMethodId: string };
  deliveryInstructions?: string;
  deliveryAddressId: string;
}

export const orderApi = {
  getActiveOrder: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ order: Order | null }>>('/api/v1/orders/active', { signal }),

  cancelOrder: (orderId: string, body: { reason?: string }) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/orders/${orderId}/cancel`, body),

  getOrders: (params: { limit: number; page: number }, signal?: AbortSignal) =>
    api.get<ApiResponse<{ orders: Order[]; pagination: ApiPagination }>>('/api/v1/orders', {
      params,
      signal,
    }),

  createOrder: (data: CreateOrderPayload) =>
    api.post<ApiResponse<{ order: Order }>>('/api/v1/orders', data),

  getOrderById: (orderId: string, signal?: AbortSignal) =>
    api.get<ApiResponse<OrderDetailsPayload>>(`/api/v1/orders/${orderId}`, { signal }),

  readdOrder: (orderId: string) =>
    api.post(`/api/v1/orders/${orderId}/readd`),

  reorder: (data: CreateOrderPayload) =>
    api.post<ApiResponse<{ order?: Order }>>('/api/v1/orders/reorder', data),
};
