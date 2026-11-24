import type { ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';

export interface RiderDeliveryItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

export interface RiderOrder {
  customerEmail?: string;
  customerFullname?: string;
  customerPhoneNumber?: string;
  items?: RiderDeliveryItem[];
  numberOfItems?: number;
  orderNumber?: string;
  orderStatus?: string;
  subTotal?: string | number;
  totalQuantityOfItems?: number;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  totalAmount?: string | number;
}

export interface RiderDelivery {
  id: string;
  assignedAt?: string;
  targetDeliveryTime: Date;
  order: RiderOrder;
}

export interface RiderDeliveryMetrics {
  /*
    ⚠️ Deliberately NOT displayed anywhere. Riders do not see earnings in this
    app — the field is kept on the type only because the endpoint really does
    return it, so the type matches the payload. Do not wire it into a screen.
  */
  todaysEarnings?: number;
  todayEarnings?: number;
  totalDeliveries?: number;
  deliveriesToday?: number;
  completedToday?: number;
  completed?: number;
  activeDeliveries?: number;
  inProgress?: number;
  pendingPickups?: number;
  remaining?: number;
  [key: string]: unknown;
}

interface DeliveriesData {
  deliveries: RiderDelivery[];
}

interface DeliveryData {
  delivery: RiderDelivery;
}

export const riderDeliveryApi = {
  getAssignedDeliveries: (signal?: AbortSignal) =>
    api.get<ApiResponse<DeliveriesData>>(
      '/api/v1/delivery-rider/deliveries', { signal }
    ),

  getAssignedDelivery: (id: string, signal?: AbortSignal) =>
    api.get<ApiResponse<DeliveryData>>(
      `/api/v1/delivery-rider/deliveries/${id}`, { signal }
    ),

  getDeliveryOverview: (signal?: AbortSignal) =>
    api.get<ApiResponse<RiderDeliveryMetrics>>(
      '/api/v1/delivery-rider/deliveries/metrics', { signal }
    ),

  pickUpOrder: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/pickup`
    ),

  startDelivery: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/start`
    ),

  exchangeCode: (id: string, code: string) =>
    api.post(
      `/api/v1/delivery-rider/deliveries/${id}/exchange-code`,
      { code }
    ),

  confirmPayment: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/confirm-payment`
    ),
};
