import api from './axios';

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

// shape returned on GET /admin/foodpacks (list)
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
  category: FoodPackCategory;
  createdAt: string;
  updatedAt: string;
  items: FoodPackDetailItem[];
  ordersSold: number;
  revenue: number;
}

// shape returned on POST create / PATCH update / add-item / remove-item
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
  imageUrls: string[];
  featuredPack?: boolean;
  visibleToCustomers?: boolean;
}

export interface UpdateFoodPackPayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
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
  getFoodPacks: (filters?: FoodPackFilters) =>
    api.get<ApiResponse<{ foodpacks: AdminFoodPackSummary[]; pagination: FoodPackPagination }>>(
      '/api/v1/admin/foodpacks',
      { params: filters }
    ),

  getFoodPackById: (id: string) =>
    api.get<ApiResponse<{ foodpack: AdminFoodPackDetail }>>(`/api/v1/admin/foodpacks/${id}`),

  createFoodPack: (data: CreateFoodPackPayload) =>
    api.post<ApiResponse<{ foodPack: FoodPackMutationResult }>>('/api/v1/admin/foodpacks', data),

  updateFoodPack: (id: string, data: UpdateFoodPackPayload) =>
    api.patch<ApiResponse<{ foodPack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${id}`,
      data
    ),

  deleteFoodPack: (id: string) =>
    api.delete<ApiResponse<Record<string, never>>>(`/api/v1/admin/foodpacks/${id}`),

  activateFoodPack: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/foodpacks/${id}/activate`),

  deactivateFoodPack: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/foodpacks/${id}/deactivate`),

  // items
  addItems: (foodpackId: string, data: AddFoodPackItemsPayload) =>
    api.post<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items`,
      data
    ),

  removeItem: (foodpackId: string, itemId: string) =>
    api.delete<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items/${itemId}`
    ),

  updateItemQuantity: (
    foodpackId: string,
    itemId: string,
    data: UpdateFoodPackItemQuantityPayload
  ) =>
    api.patch<ApiResponse<{ foodpack: FoodPackMutationResult }>>(
      `/api/v1/admin/foodpacks/${foodpackId}/items/${itemId}/quantity`,
      data
    ),

  // categories
  getCategories: () =>
    api.get<ApiResponse<{ categories: FoodPackCategory[] }>>('/api/v1/foodpacks/categories'),

  createCategory: (name: string) =>
    api.post<ApiResponse<{ foodpackCategory: FoodPackCategory }>>(
      '/api/v1/admin/foodpacks/categories',
      { name }
    ),
};