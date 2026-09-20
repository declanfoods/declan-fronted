import api from './axios';

export interface AdminProductCategory {
  id: string;
  name: string;
}

export interface AdminProductDiscount {
  id: string;
  discountValue: number;
  discountType: string;
  isPermanent: boolean;
  isExpired: boolean;
  originalPrice: string;
  discountPrice: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  scale: string;
  sku: string;
  isHidden: boolean;
  stock_status: 'AVAILABLE' | 'OUT_OF_STOCK' | string;
  quantity: number;
  createdAt: string;
  imageUrls: string[];
  category: AdminProductCategory;
  discount: AdminProductDiscount | null;
  total_orders?: number;
  total_revenue?: number;
}

export interface AdminPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/*
|--------------------------------------------------------------------------
| Category overview  (NEW dedicated endpoints)
|--------------------------------------------------------------------------
| The backend shipped a purpose-built category surface so the admin
| Categories screen no longer has to fetch every product to count them:
|
|   GET    /api/v1/admin/product-categories                 → data.categories[]
|   GET    /api/v1/admin/product-categories/metrics         → data{…}
|   POST   /api/v1/admin/product-categories                 { name } → 201
|   PATCH  /api/v1/admin/product-categories/:id             { name } → 200
|   DELETE /api/v1/admin/product-categories/:id             { fallbackCategoryId } → 200
|
| Per the backend dev: "You don't have to manually fetch products to get the
| fields you need again." He is right — `productCount`, `catalogValue` and
| `revenueGenerated` all come down with the category now, plus the product
| list itself, so nothing on this screen is computed client-side any more.
|
| ⚠️ MONEY IS A NUMBER HERE, NOT A STRING. Everywhere else in this API money
|    arrives as a string ("5155.00"). On these category payloads the samples
|    show bare numbers: "catalogValue": 5155, "revenueGenerated": 23655,
|    "totalRevenue": 137755. Both are coerced through Number() before display,
|    which is safe either way — but do not type these as string.
*/

/** A product as embedded in a category payload (trimmed — id/name/image only). */
export interface AdminCategoryProductRef {
  id: string;
  name: string;
  imageUrl?: string | null;
}

/** One row of GET /api/v1/admin/product-categories. */
export interface AdminCategoryOverview {
  id: string;
  name: string;
  /** Products filed under this category. Server-computed. */
  productCount: number;
  /** Value of the stock at list price. Server-computed. */
  catalogValue: number;
  isActive: boolean;
  /** Money actually taken from orders in this category. Server-computed. */
  revenueGenerated: number;
  /** The products themselves, so the row can expand without another call. */
  products: AdminCategoryProductRef[];
}

/** GET /api/v1/admin/product-categories/metrics */
export interface AdminCategoryMetrics {
  numberOfCategories: number;
  numberOfProducts: number;
  totalRevenue: number;
  catalogValue: number;
}

export interface AdminProductFilters {
  sortOrder?: 'asc' | 'desc';
  sortBy?: string;
  limit?: number;
  page?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  quantity: number;
  scale: string;
  categoryId: string;
  imageUrls: string[];
  featuredProduct?: boolean;
  visibleToCustomers?: boolean;
  discount?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  scale?: string;
  imageUrls?: string[];
  discount?: number;
  categoryId?: string;
}

export interface StockUpdatePayload {
  quantity: number;
  operation: 'increment' | 'decrement';
}

export interface UpdateProductPricePayload {
  currentPrice: number;
  newPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminProductApi = {
  createProduct: (data: CreateProductPayload) =>
    api.post<ApiResponse<{ product?: AdminProduct }>>('/api/v1/admin/products', data),

  getProducts: (filters?: AdminProductFilters) =>
    api.get<ApiResponse<{ products: AdminProduct[]; pagination: AdminPagination }>>(
      '/api/v1/admin/products',
      { params: filters }
    ),

  getProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(`/api/v1/admin/products/${id}`),

  updateProduct: (id: string, data: UpdateProductPayload) =>
    api.patch<ApiResponse<{ product?: AdminProduct }>>(`/api/v1/admin/products/${id}`, data),

  hideProduct: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/hide`),

  unhideProduct: (id: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/unhide`),

  getHiddenProducts: () =>
    api.get<ApiResponse<{ products: AdminProduct[] }>>(
      '/api/v1/admin/products/visibility/hidden'
    ),

  getHiddenProductById: (id: string) =>
    api.get<ApiResponse<{ product: AdminProduct }>>(
      `/api/v1/admin/products/visibilty/hidden/${id}`
    ),

  updateStock: (id: string, data: StockUpdatePayload) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/stock`, data),

  updateProductPrice: (id: string, data: UpdateProductPricePayload) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/products/${id}/price/update`, data),

  /*
    categories

    TWO families live here on purpose:

      getCategories()      → GET /api/v1/products/categories
                             the plain { id, name } list. Used by the product
                             forms to populate their dropdowns, where nothing
                             but id/name is needed. Left exactly as it was.

      getCategoryOverview()→ GET /api/v1/admin/product-categories
                             the rich admin list. Used by the admin Categories
                             screen.

    They are separate calls because they serve separate needs, and because the
    five form screens (AddProduct, EditProduct, ProductList, CreateFoodPack,
    FoodPacksList) are working — repointing them at a richer payload would be
    churn for no gain.
  */

  /** Plain { id, name } list — dropdowns in the product forms. */
  getCategories: () =>
    api.get<ApiResponse<{ productCategories: AdminProductCategory[] }>>(
      '/api/v1/products/categories'
    ),

  /** Rich admin list: counts, values, revenue and the products themselves. */
  getCategoryOverview: () =>
    api.get<ApiResponse<{ categories: AdminCategoryOverview[] }>>(
      '/api/v1/admin/product-categories'
    ),

  /** Screen-level totals for the admin Categories header cards. */
  getCategoryMetrics: () =>
    api.get<ApiResponse<AdminCategoryMetrics>>(
      '/api/v1/admin/product-categories/metrics'
    ),

  /*
    NOTE: the create/update/delete calls below now point at the NEW dedicated
    admin routes. The old `/admin/products/categories` family still answers on
    the live server, but the new ones are the documented surface and the ones
    the backend dev is maintaining, so this is where new work should go.
  */

  createCategory: (name: string) =>
    api.post<ApiResponse<{ categoryId: string; categoryName: string }>>(
      '/api/v1/admin/product-categories',
      { name }
    ),

  updateCategory: (id: string, name: string) =>
    api.patch<ApiResponse<{ categoryId: string; categoryName: string }>>(
      `/api/v1/admin/product-categories/${id}`,
      { name }
    ),

  /*
    DELETE needs a landing spot for the products that were in the category.

    The body is `{ fallbackCategoryId }` and it is NOT optional in practice:
    deleting a category that still holds products would otherwise orphan them,
    so the screen asks the admin to pick the category to move them into. Pass
    the id of the category that inherits the products.
  */
  deleteCategory: (id: string, fallbackCategoryId: string) =>
    api.delete<ApiResponse<unknown>>(`/api/v1/admin/product-categories/${id}`, {
      data: { fallbackCategoryId },
    }),
};