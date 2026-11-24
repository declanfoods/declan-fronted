import type { ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';
import type { CartItem } from '../../cart/api/cartApi';

export interface CreateGuestOrderPayload {
  payment: { paymentMethodId: string };
  deliveryInstructions?: string;
  items: Pick<CartItem, 'itemType' | 'itemId' | 'quantity'>[];
  deliveryAddress: {
    addressLine: string;
    state?: string;
    landmark?: string;
    nameOfCustomer: string;
    phoneNumber: string;
  };
  emailAddress: string;
}

type GuestOrderReference = { orderNumber: string; email: string };

export const guestCheckoutApi = {
  create: (payload: CreateGuestOrderPayload) =>
    api.post<ApiResponse<{ order?: { orderNumber?: string } }>>('/api/v1/orders/guest', payload),

  verify: ({ orderNumber, email, code }: GuestOrderReference & { code: string }) =>
    api.post<ApiResponse<unknown>>('/api/v1/orders/guest/verify', {
      orderNumber,
      customerEmail: email,
      verificationCode: code,
    }),

  resendVerification: (order: GuestOrderReference) =>
    api.post<ApiResponse<unknown>>('/api/v1/orders/guest/resend-verification', order),
};
