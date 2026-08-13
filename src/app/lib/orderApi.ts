import api from './axios';

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
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  deliveryPrice: number;
  priceOfItems: number;
  numberOfItems: number;
  totalQuantityOfItems: number;
  orderStatus: string;
  createdAt: string;        
  updatedAt?: string;      
  items: OrderItem[];
  isGuestOrder: boolean;
  customerFullname: string;
  customerEmail: string;
  customerPhoneNumber: string;
  delivery: OrderDelivery | null;
  payment: OrderPayment | null;
  rider: Record<string, any> | null;
  orderTimeline: OrderTimelineEvent[] | null;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateOrderPayload {
  payment: {
    paymentMethodId: string;
  };
  deliveryInstructions?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const orderApi = {
  getActiveOrder: () =>
    api.get<ApiResponse<{ order: Order | null }>>(
      '/api/v1/orders/active'
    ),

  getOrders: (params?: {
    limit?: number;
    page?: number;
    status?: string;
  }) =>
    api.get<ApiResponse<{ orders: Order[]; pagination: Pagination }>>(
      '/api/v1/orders',
      { params }
    ),

  createOrder: (data: CreateOrderPayload) =>
    api.post<ApiResponse<{ order: Order }>>('/api/v1/orders', data),

  getOrderById: (orderId: string) =>
    api.get<ApiResponse<{ order: Order; orderTimeline: OrderTimelineEvent[] }>>(
      `/api/v1/orders/${orderId}`
    ),

  readdOrder: (orderId: string) =>
    api.post(`/api/v1/orders/${orderId}/readd`),

  reorder: (data: CreateOrderPayload) =>
    api.post('/api/v1/orders/reorder', data),
};