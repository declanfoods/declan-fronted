import api from './axios';

export interface FoodPackCategory {
  id: string;
  name: string;
}

/*
|--------------------------------------------------------------------------
| Foodpack category overview  (NEW dedicated endpoints)
|--------------------------------------------------------------------------
|   GET    /api/v1/admin/foodpack-categories             → data.foodpackCategories[]
|   GET    /api/v1/admin/foodpack-categories/metrics      → data{…}
|   POST   /api/v1/admin/foodpack-categories              { name } → 201
|   PATCH  /api/v1/admin/foodpack-categories/:id          { name } → 200
|   DELETE /api/v1/admin/foodpack-categories/:id          { fallbackCategoryId } → 200
|
| ⚠️ THIS IS A CHANGE. Foodpack categories used to be CREATE-ONLY here: there
|    was no update and no delete endpoint, and the admin screen was built to
|    match (no rename, no delete on that tab). The backend has since shipped
|    both, so the screen may now offer them. `foodpackCount`, `catalogValue`
|    and `revenueGenerated` are new too — nothing is computed client-side.
|
| Same money note as products: these come back as NUMBERS, not the strings
| used elsewhere in this API. Coerce with Number() before formatting.
*/

/** A foodpack as embedded in a category payload. */
export interface FoodPackCategoryRef {
  id: string;
  name: string;
  imageUrl?: string | null;
}

/** One row of GET /api/v1/admin/foodpack-categories. */
export interface FoodPackCategoryOverview {
  id: string;
  name: string;
  /** Foodpacks filed under this category. Server-computed. */
  foodpackCount: number;
  isActive: boolean;
  /** Value of the packs at list price. Server-computed. */
  catalogValue: number;
  /** Money actually taken from orders in this category. Server-computed. */
  revenueGenerated: number;
  foodpacks: FoodPackCategoryRef[];
}

/** GET /api/v1/admin/foodpack-categories/metrics */
export interface FoodPackCategoryMetrics {
  /** Note: the server calls this "numberOfProducts" even for foodpacks. */
  numberOfCategories: number;
  numberOfProducts: number;
  totalRevenue: number;
  catalogValue: number;
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

  /*
    categories

    getCategories()        → GET /api/v1/foodpacks/categories
                             plain { id, name }, used by the foodpack form
                             dropdowns. Left as it was.

    getCategoryOverview()  → GET /api/v1/admin/foodpack-categories
                             rich admin list, used by the admin Categories
                             screen.
  */

  /** Plain { id, name } list — dropdowns in the foodpack forms. */
  getCategories: () =>
    api.get<ApiResponse<{ categories: FoodPackCategory[] }>>('/api/v1/foodpacks/categories'),

  /** Rich admin list: counts, values, revenue and the foodpacks themselves. */
  getCategoryOverview: () =>
    api.get<ApiResponse<{ foodpackCategories: FoodPackCategoryOverview[] }>>(
      '/api/v1/admin/foodpack-categories'
    ),

  /** Screen-level totals for the admin Categories header cards. */
  getCategoryMetrics: () =>
    api.get<ApiResponse<FoodPackCategoryMetrics>>(
      '/api/v1/admin/foodpack-categories/metrics'
    ),

  createCategory: (name: string) =>
    api.post<ApiResponse<{ foodpackCategory: FoodPackCategory }>>(
      '/api/v1/admin/foodpack-categories',
      { name }
    ),

  /** NEW — this did not exist. Rename a foodpack category. */
  updateCategory: (id: string, name: string) =>
    api.patch<ApiResponse<{ categoryId: string; categoryName: string }>>(
      `/api/v1/admin/foodpack-categories/${id}`,
      { name }
    ),

  /**
   * NEW — this did not exist either.
   *
   * Same `{ fallbackCategoryId }` body as the product side: the foodpacks in
   * the deleted category must be moved somewhere, so the admin picks where.
   */
  deleteCategory: (id: string, fallbackCategoryId: string) =>
    api.delete<ApiResponse<unknown>>(`/api/v1/admin/foodpack-categories/${id}`, {
      data: { fallbackCategoryId },
    }),
};