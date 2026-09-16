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

  /*
  |--------------------------------------------------------------------------
  | FIX: 3 rider paths did not match the backend — all three returned 404
  |--------------------------------------------------------------------------
  | The entire rider delivery lifecycle was dead. Every one of these was a
  | silent 404 caught by the caller's generic "try again" toast, so it read
  | as a flaky network rather than a wrong URL.
  |
  |   was                              →  is                (per API docs)
  |   -------------------------------     ------------------------------
  |   .../deliveries/:id/pickup          .../deliveries/:id/pick-up
  |   .../deliveries/:id/start           .../deliveries/:id/start-delivery
  |   .../deliveries/:id/exchange-code   .../deliveries/:id/code-exchange
  |
  | confirm-payment was already correct.
  */
  pickUpOrder: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/pick-up`
    ),

  startDelivery: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/start-delivery`
    ),

  exchangeCode: (id: string, code: string) =>
    api.post(
      `/api/v1/delivery-rider/deliveries/${id}/code-exchange`,
      { code }
    ),

  confirmPayment: (id: string) =>
    api.patch(
      `/api/v1/delivery-rider/deliveries/${id}/confirm-payment`
    ),
};