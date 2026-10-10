
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

export const discountApi = {
  getCurrentDiscount: () =>
    api.get<ApiResponse<{ discount: GeneralDiscount | null }>>(
      '/api/v1/discount'
    ),
};