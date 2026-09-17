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
  | ⚠️ CORRECTION — the Postman docs are WRONG on three of these four, and
  |    my previous "fix" made things worse by trusting them.
  |
  | I probed the live backend with an unauthenticated request. A 401 means
  | the route exists and the auth guard stopped us first; a 404 with
  | "Cannot PATCH …" means Express found no such route. That is a reliable
  | way to tell the two apart without credentials.
  |
  |   segment              docs say            live backend      result
  |   -------------------  ------------------  ----------------  ----------
  |   pick up              pick-up              pickup            docs wrong
  |   start delivery       start-delivery       start             docs wrong
  |   code exchange        code-exchange        exchange-code     docs wrong
  |   confirm payment      confirm-payment      confirm-payment   correct
  |
  | So the ORIGINAL code was right and the docs were wrong. The paths below
  | are the live-verified ones. If these ever change, re-run the probe:
  |
  |   curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  |     https://api-declanfoods.onrender.com/api/v1/delivery-rider/deliveries/<id>/<segment>
  |
  |   401 → route exists     404 "Cannot PATCH" → route does not exist
  |
  | Confirmed on the live server: all four now return 401 (i.e. they resolve
  | and wait for a token) instead of 404.
  */
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