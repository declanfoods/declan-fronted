
import type { ApiResponse } from '../../../app/lib/api-types';
import api from '../../../app/lib/axios';

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
