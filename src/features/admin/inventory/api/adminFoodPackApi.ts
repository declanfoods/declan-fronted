import { refreshAfterInventoryWrite } from '../cache';
import api from '../../../../app/lib/axios';

export interface FoodPackCategory {
  id: string;
  name: string;
}


export interface FoodPackItem {
  id: string;
  name: string;
  quantityOfProductInPack: number;
  quantityUnit: string;
  itemImageUrls: string[];
}


export interface AdminFoodPackSummary {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrls: string[];
  price: number;
  originalPrice: number;
  featuredPack: boolean;
  isHidden: boolean;
  percentOff: number;
  itemCount: number;
  category: FoodPackCategory;
  createdAt: string;
  updatedAt: string;
}

// shape returned on GET /admin/foodpacks/:id (detail)
export interface FoodPackDetailItem {
  id: string;
  name: string;
  imageUrls: string[];
  quantity: number;
  productId: string;
}

export interface AdminFoodPackDetail {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrls: string[];
  price: number;
  originalPrice: number;
  featuredPack: boolean;
  isHidden: boolean;
  percentOff: number;
  itemCount: number;
  acceptPaymentOnDelivery: boolean;
  category: FoodPackCategory;
  createdAt: string;
  updatedAt: string;
  items: FoodPackDetailItem[];
  ordersSold: number;
  revenue: number;
}

export interface FoodPackMutationResult {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  price: string;
  originalPrice: number;
  amountOff: number;
  amounOffInPercent: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  items: FoodPackItem[];
  category: FoodPackCategory;
}

export interface FoodPackPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FoodPackFilters {
  limit?: number;
  page?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface FoodPackProductInput {
  productId: string;
  quantity: number;
  quantityUnit: string;
}

export interface CreateFoodPackPayload {
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  items: FoodPackProductInput[];
  acceptPaymentOnDelivery: boolean;
  imageUrls: string[];
  featuredPack?: boolean;
  visibleToCustomers?: boolean;
}

export interface UpdateFoodPackPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  acceptPaymentOnDelivery?: boolean;
  imageUrls?: string[];
  featuredPack?: boolean;
  visibleToCustomers?: boolean;
}

export interface AddFoodPackItemsPayload {
  items: { productId: string; quantity: number }[];
}

export interface UpdateFoodPackItemQuantityPayload {
  operation: 'increment' | 'decrement';
  quantity: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminFoodPackApi = {
  getFoodPacks: (filters?: FoodPackFilters, signal?: AbortSignal) =>
    api.get<ApiResponse<{ foodpacks: AdminFoodPackSummary[]; pagination: FoodPackPagination }>>(
      '/api/v1/admin/foodpacks',
      { params: filters, signal }
    ),

  getFoodPackById: (id: string) =>
    api.get<ApiResponse<{ foodpack: AdminFoodPackDetail }>>(`/api/v1/admin/foodpacks/${id}`),

  createFoodPack: (data: CreateFoodPackPayload) =>
    refreshAfterInventoryWrite(api.post<ApiResponse<{ foodPack: FoodPackMutationResult }>>('/api/v1/admin/foodpacks', data)),

  updateFoodPack: (id: string, data: UpdateFoodPackPayload) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<{ foodPack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${id}`,
      data
    )),

  deleteFoodPack: (id: string) =>
    refreshAfterInventoryWrite(api.delete<ApiResponse<Record<string, never>>>(`/api/v1/admin/foodpacks/${id}`)),

  activateFoodPack: (id: string) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/foodpacks/${id}/activate`)),

  deactivateFoodPack: (id: string) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<unknown>>(`/api/v1/admin/foodpacks/${id}/deactivate`)),


  addItems: (foodpackId: string, data: AddFoodPackItemsPayload) =>
    refreshAfterInventoryWrite(api.post<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items`,
      data
    )),

  removeItem: (foodpackId: string, itemId: string) =>
    refreshAfterInventoryWrite(api.delete<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items/${itemId}`
    )),

  updateItemQuantity: (
    foodpackId: string,
    itemId: string,
    data: UpdateFoodPackItemQuantityPayload
  ) =>
    refreshAfterInventoryWrite(api.patch<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items/${itemId}/quantity`,
      data
    )),
};
