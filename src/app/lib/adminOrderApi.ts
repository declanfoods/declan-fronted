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
  phone?: string;
  email?: string;
}

export interface AdminOrderItem {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number | string;
  imageUrls?: string[];
}

export interface AdminOrder {
  id: string;
  orderStatus: AdminOrderStatus;
  amount?: number | string;
  paymentStatus?: string;
  createdAt?: string;
  customer?: AdminOrderCustomer;
  numberOfItems: number;
  orderNumber: string;
  items?: AdminOrderItem[];
  rider?: { id: string; name: string } | null;
  [key: string]: unknown;
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminOrderApi = {
  getOrders: (filters?: AdminOrderFilters) =>
    api.get<ApiResponse<{ orders: AdminOrder[]; pagination: AdminOrderPagination }>>(
      '/api/v1/admin/orders',
      { params: filters }
    ),

  getOrderById: (id: string) =>
    api.get<ApiResponse<{ order: AdminOrder }>>(`/api/v1/admin/orders/${id}`),

  markAsProcessing: (id: string) =>
    api.patch<ApiResponse<{ order?: AdminOrder }>>(`/api/v1/admin/orders/${id}/processing`),

  assignRider: (id: string, data: AssignRiderPayload) =>
    api.patch<ApiResponse<{ order?: AdminOrder }>>(
      `/api/v1/admin/orders/${id}/assign-rider`,
      data
    ),
};