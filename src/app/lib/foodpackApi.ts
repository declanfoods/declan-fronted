import api from './axios';

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

import type { Pagination } from './productApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const foodpackApi = {
  getFoodpacks: (filters?: FoodpackFilters) =>
    api.get<ApiResponse<{ foodPacks: ApiFoodpack[]; pagination: Pagination }>>(
      '/api/v1/foodpacks',
      { params: filters }
    ),
};