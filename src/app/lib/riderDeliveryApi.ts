import api from './axios';

export interface RiderDelivery {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const riderDeliveryApi = {
  getAssignedDeliveries: () =>
    api.get<ApiResponse<{ deliveries: RiderDelivery[] }>>('/api/v1/delivery-rider/deliveries'),

  getDeliveryOverview: () =>
    api.get<ApiResponse<unknown>>('/api/v1/delivery-rider/deliveries/metrics'),

  getAssignedDelivery: (deliveryId: string) =>
    api.get<ApiResponse<{ delivery: RiderDelivery }>>(
      `/api/v1/delivery-rider/deliveries/${deliveryId}`
    ),

  pickUpOrder: (deliveryId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/delivery-rider/deliveries/${deliveryId}/pick-up`),

  startDelivery: (deliveryId: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/delivery-rider/deliveries/${deliveryId}/start-delivery`
    ),

  exchangeCode: (deliveryId: string, code: string) =>
    api.post<ApiResponse<unknown>>(
      `/api/v1/delivery-rider/deliveries/${deliveryId}/code-exchange`,
      { code }
    ),

  confirmPayment: (deliveryId: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/delivery-rider/deliveries/${deliveryId}/confirm-payment`
    ),
};
