import { refreshAfterInventoryWrite } from '../cache';
import api from '../../../../app/lib/axios';

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
    refreshAfterInventoryWrite(api.post<ApiResponse<unknown>>(`/api/v1/admin/discounts/products/${productId}`, data)),

  deleteDiscount: (productId: string) =>
    refreshAfterInventoryWrite(api.delete<ApiResponse<unknown>>(`/api/v1/admin/discounts/products/${productId}`)),
};
