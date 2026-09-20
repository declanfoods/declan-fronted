import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { adminProductApi } from '../lib/adminProductApi';
import type {
  AdminCategoryMetrics,
  AdminCategoryOverview,
} from '../lib/adminProductApi';
import { adminFoodPackApi } from '../lib/adminFoodPackApi';
import type {
  FoodPackCategoryMetrics,
  FoodPackCategoryOverview,
} from '../lib/adminFoodPackApi';
import { queryKeys } from '../lib/query-client';

/*
|==========================================================================
| Admin category hooks
|==========================================================================
|
| WHAT CHANGED, AND WHY THIS FILE IS MUCH SHORTER THAN IT WAS
|
| The backend shipped purpose-built category endpoints. The old comment in
| this file said, accurately at the time:
|
|   "There is no 'products in this category' count and no 'revenue generated'
|    figure on either endpoint — the category objects are literally
|    { id, name }. The item counts on this screen are therefore computed
|    client-side by grouping the full product / foodpack lists, ... Revenue is
|    not derivable at all."
|
| That is no longer true, and the client-side workaround it forced is gone:
|
|   DELETED  useCategoryProductIndex()     — fetched every product to count them
|   DELETED  useCategoryFoodPackIndex()    — same for foodpacks
|   DELETED  fetchAllPages()
|   DELETED  INDEX_PAGE_SIZE / INDEX_MAX_PAGES / isIndexTruncated()
|   DELETED  buildProductCategoryRows() / buildFoodPackCategoryRows()
|
| All of it existed to work around a missing count. The count is now a field:
|
|   GET /api/v1/admin/product-categories          → productCount, catalogValue,
|                                                   revenueGenerated, isActive,
|                                                   products[]
|   GET /api/v1/admin/foodpack-categories         → foodpackCount, catalogValue,
|                                                   revenueGenerated, isActive,
|                                                   foodpacks[]
|   GET /api/v1/admin/product-categories/metrics  → numberOfCategories,
|                                                   numberOfProducts,
|                                                   totalRevenue, catalogValue
|   GET /api/v1/admin/foodpack-categories/metrics → same four fields
|
| The backend dev's note was: "You don't have to manually fetch products to
| get the fields you need again." Correct — and the truncation warning that
| the paging workaround needed is gone with it, because nothing is paged and
| nothing is guessed any more.
|
| ---------------------------------------------------------------------------
| FOOD PACK CATEGORIES ARE NO LONGER CREATE-ONLY
| ---------------------------------------------------------------------------
| The old comment here also said foodpack categories had no update and no
| delete route, and the screen was built around that limit. Both routes exist
| now:
|
|   PATCH  /api/v1/admin/foodpack-categories/:id
|   DELETE /api/v1/admin/foodpack-categories/:id
|
| So the food pack tab gets the same rename and delete affordances as the
| product tab. There is no reason to hide them.
|
| ---------------------------------------------------------------------------
| DELETE NEEDS A DESTINATION
| ---------------------------------------------------------------------------
| Both deletes take a body: { fallbackCategoryId }. The items sitting in the
| deleted category have to land somewhere, so `useDelete*Category` requires
| that id and the screen asks the admin to pick. This replaces the old dialog
| that could only say "move them somewhere else first" without offering a way
| to do it.
*/

/* --------------------------------------------------------------------------
 * Row shape shared by both tabs
 * ------------------------------------------------------------------------ */

/**
 * One category, normalised so the screen can render either tab with the same
 * JSX. Product and foodpack payloads differ only in the name of their count
 * field, which is handled in the two mappers below.
 */
export type CategoryRow = {
  id: string;
  name: string;
  /** Products or foodpacks in this category. Straight from the server. */
  itemCount: number;
  /** Stock at list price. NOT revenue — labelled as such on screen. */
  catalogValue: number;
  /** Real money taken from orders in this category. Server-computed. */
  revenueGenerated: number;
  isActive: boolean;
  /** The embedded items, for the expandable list. No price — see note. */
  items: { id: string; name: string; imageUrl?: string | null }[];
};

/*
  NOTE on the expanded item rows: the embedded `products[]` / `foodpacks[]`
  arrays carry only { id, name, imageUrl }. There is no per-item price in the
  payload, so the old per-item price column is gone. That is fine — the two
  numbers the admin actually came for, catalog value and revenue, are now
  per-CATEGORY figures from the server rather than a sum the client invented.
*/

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Product payload → shared row shape. */
export function toProductCategoryRows(
  categories: AdminCategoryOverview[]
): CategoryRow[] {
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    // Coerced rather than trusted: these fields arrive as numbers in the
    // documented samples, but every other money field in this API is a
    // string, so nothing here assumes either.
    itemCount: toNumber(c.productCount),
    catalogValue: toNumber(c.catalogValue),
    revenueGenerated: toNumber(c.revenueGenerated),
    isActive: c.isActive !== false,
    items: c.products ?? [],
  }));
}

/** Foodpack payload → shared row shape. Same handling. */
export function toFoodPackCategoryRows(
  categories: FoodPackCategoryOverview[]
): CategoryRow[] {
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    itemCount: toNumber(c.foodpackCount),
    catalogValue: toNumber(c.catalogValue),
    revenueGenerated: toNumber(c.revenueGenerated),
    isActive: c.isActive !== false,
    items: c.foodpacks ?? [],
  }));
}

/**
 * Screen-level totals, normalised across the two metrics endpoints.
 *
 * Both endpoints return the same four field names, including the slightly odd
 * `numberOfProducts` on the foodpack side — that is what the server sends, so
 * it is read as-is and re-labelled here rather than at every call site.
 */
export type CategoryMetricsView = {
  numberOfCategories: number;
  numberOfItems: number;
  totalRevenue: number;
  catalogValue: number;
};

function toMetricsView(m: AdminCategoryMetrics | FoodPackCategoryMetrics): CategoryMetricsView {
  return {
    numberOfCategories: toNumber(m.numberOfCategories),
    numberOfItems: toNumber(m.numberOfProducts),
    totalRevenue: toNumber(m.totalRevenue),
    catalogValue: toNumber(m.catalogValue),
  };
}

/* --------------------------------------------------------------------------
 * Reads
 * ------------------------------------------------------------------------ */

/** Rich product categories — GET /api/v1/admin/product-categories */
export function useProductCategoryOverview(): UseQueryResult<AdminCategoryOverview[], Error> {
  return useQuery<AdminCategoryOverview[], Error>({
    queryKey: queryKeys.productCategoryOverview,
    queryFn: async () => {
      const res = await adminProductApi.getCategoryOverview();
      return res.data.data.categories ?? [];
    },
  });
}

/** Rich foodpack categories — GET /api/v1/admin/foodpack-categories */
export function useFoodPackCategoryOverview(): UseQueryResult<
  FoodPackCategoryOverview[],
  Error
> {
  return useQuery<FoodPackCategoryOverview[], Error>({
    queryKey: queryKeys.foodPackCategoryOverview,
    queryFn: async () => {
      const res = await adminFoodPackApi.getCategoryOverview();
      return res.data.data.foodpackCategories ?? [];
    },
  });
}

/** Product category totals — GET /api/v1/admin/product-categories/metrics */
export function useProductCategoryMetrics(): UseQueryResult<CategoryMetricsView, Error> {
  return useQuery<CategoryMetricsView, Error>({
    queryKey: queryKeys.productCategoryMetrics,
    queryFn: async () => {
      const res = await adminProductApi.getCategoryMetrics();
      return toMetricsView(res.data.data);
    },
  });
}

/** Foodpack category totals — GET /api/v1/admin/foodpack-categories/metrics */
export function useFoodPackCategoryMetrics(): UseQueryResult<CategoryMetricsView, Error> {
  return useQuery<CategoryMetricsView, Error>({
    queryKey: queryKeys.foodPackCategoryMetrics,
    queryFn: async () => {
      const res = await adminFoodPackApi.getCategoryMetrics();
      return toMetricsView(res.data.data);
    },
  });
}

/* --------------------------------------------------------------------------
 * Writes — product categories
 * ------------------------------------------------------------------------ */

/**
 * The API rejects a duplicate name with 409 "Category already exists". That
 * message is specific and useful, so the screen passes it straight through
 * instead of replacing it with a generic failure toast.
 */
export function useCreateProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminProductApi.createCategory(name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryMetrics });
      /*
        The dropdown lists on the product forms read the other, plain
        endpoint. Renaming or adding a category here has to show up there too,
        or the admin creates a category and then cannot pick it.
      */
      qc.invalidateQueries({ queryKey: queryKeys.productCategories });
    },
  });
}

export function useUpdateProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminProductApi.updateCategory(id, name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryMetrics });
      qc.invalidateQueries({ queryKey: queryKeys.productCategories });
    },
  });
}

/**
 * Deletes a product category, moving its products to `fallbackCategoryId`.
 *
 * The id is required by the API — a category holding products cannot simply
 * vanish. The screen collects it from the admin.
 */
export function useDeleteProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      fallbackCategoryId,
    }: {
      id: string;
      fallbackCategoryId: string;
    }) => adminProductApi.deleteCategory(id, fallbackCategoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryMetrics });
      qc.invalidateQueries({ queryKey: queryKeys.productCategories });
      /*
        The moved products now sit in a different category, so the product list
        screens are stale too. There is no dedicated product-list query key in
        this app, so the whole admin branch is invalidated — broader than
        ideal, but correct, and this only runs after a category is deleted.
      */
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

/* --------------------------------------------------------------------------
 * Writes — foodpack categories
 * ------------------------------------------------------------------------ */

export function useCreateFoodPackCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminFoodPackApi.createCategory(name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryMetrics });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategories });
    },
  });
}

/** NEW — foodpack categories could not be renamed before. */
export function useUpdateFoodPackCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminFoodPackApi.updateCategory(id, name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryMetrics });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategories });
    },
  });
}

/** NEW — foodpack categories could not be deleted before. */
export function useDeleteFoodPackCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      fallbackCategoryId,
    }: {
      id: string;
      fallbackCategoryId: string;
    }) => adminFoodPackApi.deleteCategory(id, fallbackCategoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategoryMetrics });
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategories });
      // Same reasoning as the product side: the moved packs are stale.
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}