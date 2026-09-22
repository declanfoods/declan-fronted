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
  estimatedDeliveryTime: Date | null;
  orderStatus: string;
  /*
  |--------------------------------------------------------------------------
  | FIX: `createdAt` is NOT returned by the orders endpoints
  |--------------------------------------------------------------------------
  | This was declared as a required `string`, which is what put "Invalid date"
  | on every row of the customer Orders page: the field is missing from the
  | response, so `new Date(undefined)` rendered as "Invalid date".
  |
  | Checked every order response in the collection — GET /orders,
  | GET /orders/:orderId, GET /orders/active, GET /admin/orders,
  | GET /admin/users/:id/orders, POST /orders, POST /orders/reorder — and
  | **not one of them contains a `createdAt` key** on the order object.
  |
  | The only real timestamp available is in `orderTimeline`, e.g.
  |   { "label": "Order Placed", "passed": true, "passedAt": "2026-06-28T…" }
  | and that is only populated on the DETAIL endpoint — on the list it comes
  | back null. So the list genuinely has no date to show.
  |
  | Marked optional so TypeScript forces every caller to handle its absence
  | instead of printing a broken date. See `orderDate()` in Orders.tsx.
  |
  | ⚠️ This is a backend gap. Ask them to add `createdAt` (ISO string) to the
  |    order object on GET /api/v1/orders. Until they do, there is no date to
  |    display on the list — nothing the frontend can derive it from.
  */
  createdAt?: string;
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
  /*
  |--------------------------------------------------------------------------
  | FIX: `deliveryAddressId` was missing from this type entirely
  |--------------------------------------------------------------------------
  | The collection's example body for POST /api/v1/orders is:
  |
  |   {
  |     "payment": { "paymentMethodId": "05ee8152-..." },
  |     "deliveryInstructions": "Leave at the door",
  |     "deliveryAddressId": "96bfb8b3-896c-46f8-a343-e017cbed7ece"
  |   }
  |
  | The checkout screen was sending only `payment` and `deliveryInstructions`,
  | so orders went through WITHOUT a delivery address — the order could be
  | created with nowhere to deliver it, or rejected outright depending on how
  | strictly the backend validates.
  |
  | This also accepts a nested `deliveryAddress` object, which is what the
  | guest endpoint takes. Only one gets sent; see Checkout.tsx.
  */
  deliveryAddressId?: string;
  deliveryAddress?: {
    nameOfCustomer: string;
    addressLine: string;
    phoneNumber: string;
    state?: string;
    country?: string;
  };
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