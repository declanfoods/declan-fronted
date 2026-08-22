import api from './axios';
import type { Order, OrderTimelineEvent } from './orderApi';
export interface GuestDeliveryAddress {
  addressLine: string;
  city?: string;
  state?: string;
  landmark?: string;
  [key: string]: unknown;
}

export interface GuestOrderItem {
  productId?: string;
  foodPackId?: string;
  quantity: number;
}

export interface CreateGuestOrderPayload {
  // Exact shape isn't documented for guest orders — kept flexible.
  payment: { [key: string]: unknown };
  deliveryInstructions?: string;
  items: GuestOrderItem[];
  deliveryAddress: GuestDeliveryAddress;
  emailAddress: string;
  nameOfCustomer:string;
  phoneNumber:string;
}

export interface VerifyGuestOrderPayload {
  customerEmail: string;
  verificationCode: string;
  orderNumber: string;
}

export interface TrackGuestOrderPayload {
  orderNumber: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const guestOrderApi = {
  createGuestOrder: (data: CreateGuestOrderPayload) =>
    api.post<ApiResponse<{ orderNumber: string; [key: string]: unknown }>>(
      '/api/v1/orders/guest',
      data
    ),

  verifyGuestOrder: (data: VerifyGuestOrderPayload) =>
    api.post<ApiResponse<unknown>>('/api/v1/orders/guest/verify', data),

   trackGuestOrder: (data: TrackGuestOrderPayload) =>
    api.post<ApiResponse<{ order: Order; orderTimeline?: OrderTimelineEvent[] }>>(
      '/api/v1/orders/guest/order-tracking',
      data
    ),
};