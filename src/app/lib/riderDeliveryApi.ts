import api from './axios';

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
  order: RiderOrder;
}

export interface RiderDeliveryMetrics {
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

interface DeliveriesData {
  deliveries: RiderDelivery[];
}

interface DeliveryData {
  delivery: RiderDelivery;
}

interface MetricsData extends RiderDeliveryMetrics {}

export const riderDeliveryApi = {
  getAssignedDeliveries: () =>
    api.get<ApiResponse<DeliveriesData>>(
      '/api/v1/delivery-rider/deliveries'
    ),

  getAssignedDelivery: (id: string) =>
    api.get<ApiResponse<DeliveryData>>(
      `/api/v1/delivery-rider/deliveries/${id}`
    ),

  getDeliveryOverview: () =>
    api.get<ApiResponse<MetricsData>>(
      '/api/v1/delivery-rider/deliveries/metrics'
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