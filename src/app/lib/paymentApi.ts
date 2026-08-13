import api from './axios';

export interface PaymentMethod {
  id: string;
  title: string;         // NOT "name"
  description: string;   // no isDefault field
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const paymentApi = {
  getPaymentMethods: () =>
    // Note: API has a typo — "paymentMethodds" (extra d)
    api.get<ApiResponse<{ paymentMethodds: PaymentMethod[] }>>(
      '/api/v1/payment-method'
    ),
};