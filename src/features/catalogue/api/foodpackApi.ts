import api from '../../../app/lib/axios';
import type { ApiPagination, ApiResponse } from '../../../app/lib/api-types';

export interface FoodpackItem {
  id: string;
  name: string;
  quantityOfProductInPack: number;
  quantityUnit: string;
  itemImageUrls: string[];
}

export interface ApiFoodpack {
  id: string;
  name: string;
  description: string;
  status: string;
  price: string;
  originalPrice: number;
  amountOff: number;
  amounOffInPercent: number;
  acceptPaymentOnDelivery: boolean;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  items: FoodpackItem[] | null;
  category: {
    id: string;
    name: string;
  };
}

export interface FoodpackFilters {
  maxPrice?: number;
  minPrice?: number;
  sortOrder?: 'asc' | 'desc';
  sortBy?: 'rating' | 'price' | 'date';
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export const foodpackApi = {
  getFoodpacks: (filters?: FoodpackFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{ foodPacks: ApiFoodpack[]; pagination: ApiPagination }>>(
      '/api/v1/foodpacks',
      { params: filters, signal }
    ),

  getFoodpackById: (id: string) =>
    api.get<ApiResponse<{ foodpack: ApiFoodpack }>>(`/api/v1/foodpacks/${id}`),
};
