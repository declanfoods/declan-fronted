import type { ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';
import type { OrderDetailsPayload } from './orderApi';

export interface GuestOrderLookup {
  orderNumber: string;
  email: string;
}

export const guestOrderApi = {
  trackGuestOrder: (lookup: GuestOrderLookup, signal?: AbortSignal) =>
    api.post<ApiResponse<OrderDetailsPayload>>('/api/v1/orders/guest/order-tracking', lookup, { signal }),
};
