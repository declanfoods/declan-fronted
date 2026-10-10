import api from './axios';

export interface CreateDiscountPayload {
  discountValue: number;
  discountType: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminDiscountApi = {
  createDiscount: (productId: string, data: CreateDiscountPayload) =>
    api.post<ApiResponse<unknown>>(`/api/v1/admin/discounts/products/${productId}`, data),

  deleteDiscount: (productId: string) =>
    api.delete<ApiResponse<unknown>>(`/api/v1/admin/discounts/products/${productId}`),
};