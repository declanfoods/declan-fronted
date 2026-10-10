import type { ApiResponse } from './api-types';
import api from './axios';

export interface GeneralDiscount {
  id:                      string;
  title:                   string;
  percentageOff:           number;
  overrideProductDiscount: boolean;
  expiresAt:               Date;
  isActive:                boolean;
  createdAt:               Date;
}

interface PaginationMeta {
  totalItems:      number;
  totalPages:      number;
  currentPage:     number;
  pageSize:        number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export const adminGeneralDiscountApi = {
  createDiscount: (body: {
    title:                   string;
    percentOff:              number;
    expiresAt:               Date;
    overrideProductDiscount: boolean;
  }) =>
    api.post<ApiResponse<{ discount: GeneralDiscount }>>(
      '/api/v1/admin/discounts',
      body
    ),

  getDiscounts: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ discounts: GeneralDiscount[]; pagination: PaginationMeta }>>(
      '/api/v1/admin/discounts',
      { params }
    ),

  updateDiscount: (
    id: string,
    body: {
      title?:                   string;
      percentOff?:              number;
      expiresAt?:               Date;
      overrideProductDiscount?: boolean;
      isActive?:                boolean;
    }
  ) =>
    api.patch<ApiResponse<{ discount: GeneralDiscount }>>(
      `/api/v1/admin/discounts/${id}`,
      body
    ),
};