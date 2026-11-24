import type { ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';

export interface PaymentMethod {
  id: string;
  title: string;
  description?: string;
}

export const paymentApi = {
  async getPaymentMethods(signal?: AbortSignal) {
    const { data } = await api.get<ApiResponse<{ paymentMethodds: PaymentMethod[] }>>(
      '/api/v1/payment-method',
      { signal },
    );
    return data?.data?.paymentMethodds ?? [];
  },
};
