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
}


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
  
  getOrders: (filters?: AdminOrderFilters) =>
    api.get<
      ApiResponse<{
        orders: AdminOrder[];
        pagination: AdminOrderPagination;
      }>
    >('/api/v1/admin/orders', {
      params: filters,
    }),

  
  getOrderById: (id: string) =>
    api.get<
      ApiResponse<{
        order: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}`),

  

  markAsProcessing: (id: string) =>
    api.patch<
      ApiResponse<{
        order?: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}/processing`),


  assignRider: (id: string, data: AssignRiderPayload) =>
    api.patch<
      ApiResponse<{
        order?: AdminOrderDetails;
      }>
    >(`/api/v1/admin/orders/${id}/assign-rider`, data),

  getMetrics: (period?: OrderMetricsPeriod) =>
    api.get<ApiResponse<{ metrics: AdminOrderMetrics }>>(
      '/api/v1/admin/orders/metrics',
      { params: period ? { period } : undefined }
    ),
};

export type OrderMetricsPeriod = 'today' | 'week' | 'month';

export interface OrderMetricsCounts {
  total: number;
  delivered: number;
  pending: number;
  cancelled: number;
}

export interface OrderMetricsStatusSlice {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderMetricsDay {
  day: string;
  count: number;
}

export interface OrderMetricsHour {
  hour: number;
  label: string;
  count: number;
}

export interface OrderMetricsTopItem {
  itemId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  weeklyGrowthPct: number | null;
}

export interface AdminOrderMetrics {
  period: OrderMetricsPeriod;
  avgOrderValue: number;
  deliverySuccessRate: number;
  counts: OrderMetricsCounts;
  statusDistribution: OrderMetricsStatusSlice[];
  dailyVolume: OrderMetricsDay[];
  peakHours: OrderMetricsHour[];
  topProducts: OrderMetricsTopItem[];
  topFoodPacks: OrderMetricsTopItem[];
}