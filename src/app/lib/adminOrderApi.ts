import api from './axios';

export type AdminOrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'CODE_EXCHANGED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AdminOrderCustomer {
  id?: string;
  fullname?: string;
  isGuestUser?: boolean;
  profilePicture?: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  orderStatus: AdminOrderStatus;
  amount?: number | string;
  paid?: boolean;

  customer?: AdminOrderCustomer;

  deliveryAddress?: string;

  numberOfItems?: number;

  placedAt?: string;

  paymentMethod?: {
    id?: string;
    title?: string;
    description?: string;
  };

  rider?: {
    id: string;
    fullname: string;
  } | null;
}

export interface AdminOrderPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminOrderFilters {
  limit?: number;
  page?: number;
  status?: AdminOrderStatus;
}

export interface AssignRiderPayload {
  riderId: string;
  note?: string | null;
  estimatedDeliveryTime: string
}

/*
|--------------------------------------------------------------------------
| Order Details
|--------------------------------------------------------------------------
| The GET /admin/orders/:id endpoint returns a different structure from
| GET /admin/orders.
*/

export interface AdminOrderDetailsCustomer {
  id: string;
  fullname: string;
  phone: string;
  addressLine: string;
  customerType: string;
}

export interface AdminOrderDetailsSummary {
  subTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface AdminOrderPayment {
  id: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
}

export interface AdminOrderTimeline {
  status?: string;
  timestamp?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminOrderDetailsItem {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number | string;
  imageUrls?: string[];
  [key: string]: unknown;
}

export interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: AdminOrderStatus;
  estimatedDelivery: string;
  orderTimeline: AdminOrderTimeline[];

  customer: AdminOrderDetailsCustomer;

  deliveryRider: {
    id: string;
    fullname?: string;
    name?: string;
  } | null;

  orderItems: AdminOrderDetailsItem[];

  orderSummary: AdminOrderDetailsSummary;

  payment: AdminOrderPayment;

  createdAt?: string;

  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminOrderApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Orders
  |--------------------------------------------------------------------------
  */

  getOrders: (filters?: AdminOrderFilters) =>
    api.get<
      ApiResponse<{
        orders: AdminOrder[];
        pagination: AdminOrderPagination;
      }>
    >('/api/v1/admin/orders', {
      params: filters,
    }),

  /*
  |--------------------------------------------------------------------------
  | Get Single Order
  |--------------------------------------------------------------------------
  */

  getOrderById: (id: string) =>
    api.get<
      ApiResponse<{
        order: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}`),

  /*
  |--------------------------------------------------------------------------
  | Mark Order As Processing
  |--------------------------------------------------------------------------
  */

  markAsProcessing: (id: string, requestBody: {note: string, estimatedDeliveryTime: string}) =>
    api.patch<
      ApiResponse<{
        order?: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}/processing`, {...requestBody}),

  /*
  |--------------------------------------------------------------------------
  | Assign Rider
  |--------------------------------------------------------------------------
  */

  assignRider: (id: string, data: AssignRiderPayload) =>
    api.patch<
      ApiResponse<{
        order?: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}/assign-rider`, data),

  /*
  |--------------------------------------------------------------------------
  | Order metrics — GET /api/v1/admin/orders/metrics
  |--------------------------------------------------------------------------
  | The whole admin "Order Insights" screen runs on this one call now; every
  | figure on it used to be hardcoded in the component.
  |
  | `?period=` accepts today | week | month and defaults to week. Each returns
  | the same shape with different numbers, so the period selector is a real
  | refetch rather than client-side filtering.
  |
  | ⚠️ TWO QUIRKS IN THE PAYLOAD, both visible in the saved responses:
  |
  |   1. `dailyVolume` CAN REPEAT A DAY. The month sample contains "Mon"
  |      twice (counts 3 and 1) and the week sample is ordered Mon, Tue —
  |      it is not a fixed seven-slot week. Rendering it straight gives
  |      duplicate React keys and two bars labelled Mon, so the screen sums
  |      by day name before drawing.
  |
  |   2. `weeklyGrowthPct` IS NULL when there is no prior week to compare
  |      against. That is not zero growth — it is unknown — so the screen
  |      omits the trend chip entirely rather than printing "+0%" or "null%".
  |
  | `deliverySuccessRate` and the status percentages are 0-100 numbers, not
  | 0-1 fractions. `avgOrderValue`, `totalRevenue` and `totalSold` are plain
  | numbers, not the strings used elsewhere in this API.
  */
  getMetrics: (period?: OrderMetricsPeriod) =>
    api.get<ApiResponse<{ metrics: AdminOrderMetrics }>>(
      '/api/v1/admin/orders/metrics',
      { params: period ? { period } : undefined }
    ),
};

/** The three windows the metrics endpoint accepts. */
export type OrderMetricsPeriod = 'today' | 'week' | 'month';

export interface OrderMetricsCounts {
  total: number;
  delivered: number;
  pending: number;
  cancelled: number;
}

export interface OrderMetricsStatusSlice {
  /** UPPERCASE, e.g. 'DELIVERED'. */
  status: string;
  count: number;
  /** 0-100, not a fraction. */
  percentage: number;
}

export interface OrderMetricsDay {
  /** Three-letter day name, e.g. 'Mon'. May repeat — sum before rendering. */
  day: string;
  count: number;
}

export interface OrderMetricsHour {
  /** 0-23. */
  hour: number;
  /** Pre-formatted 'HH:00'. */
  label: string;
  count: number;
}

/** One product or foodpack in the leaderboard. */
export interface OrderMetricsTopItem {
  itemId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  /** null means "no prior week to compare" — NOT zero. */
  weeklyGrowthPct: number | null;
}

export interface AdminOrderMetrics {
  period: OrderMetricsPeriod;
  /** Plain number, not a money string. */
  avgOrderValue: number;
  /** 0-100. */
  deliverySuccessRate: number;
  counts: OrderMetricsCounts;
  statusDistribution: OrderMetricsStatusSlice[];
  dailyVolume: OrderMetricsDay[];
  /** Always all 24 hours, zeros included. */
  peakHours: OrderMetricsHour[];
  topProducts: OrderMetricsTopItem[];
  /** Same shape as topProducts — foodpacks are tracked separately. */
  topFoodPacks: OrderMetricsTopItem[];
}