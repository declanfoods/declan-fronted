import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { adminProductApi } from '../lib/adminProductApi';
import type { AdminProduct, AdminProductCategory } from '../lib/adminProductApi';
import { adminFoodPackApi } from '../lib/adminFoodPackApi';
import type { AdminFoodPackSummary, FoodPackCategory } from '../lib/adminFoodPackApi';
import { queryKeys } from '../lib/query-client';

/*
|==========================================================================
| Admin category hooks
|==========================================================================
|
| WHAT THE BACKEND ACTUALLY HAS — verified, not assumed
|
|   Product categories
|     GET    /api/v1/products/categories          → data.productCategories[]
|     POST   /api/v1/admin/products/categories    { name } → 201
|     PATCH  /api/v1/admin/products/categories/:id { name } → 200
|     DELETE /api/v1/admin/products/categories/:id
|
|   Food pack categories
|     GET    /api/v1/foodpacks/categories         → data.categories[]
|     POST   /api/v1/admin/foodpacks/categories   { name } → 201
|
| All six were probed against the live server and exist (GET returns 200/401,
| not a route-missing 404). So this screen runs on REAL data — no mocks.
|
| ⚠️ WHAT IS *NOT* THERE: any per-category metric. There is no
|    "products in this category" count and no "revenue generated" figure on
|    either endpoint — the category objects are literally `{ id, name }`.
|
|    The item counts on this screen are therefore computed client-side by
|    grouping the full product / foodpack lists, which is real data. Revenue
|    is not derivable at all (it would need orders joined to categories), so
|    the UI shows an explicit "awaiting backend" state rather than a made-up
|    number. See the note at the top of CategoriesOverview.tsx.
|
| ⚠️ Food pack categories are CREATE-ONLY. There is no update or delete
|    endpoint for them, so the UI must not offer rename/delete on that tab.
|    Product categories have the full set.
*/

/* --------------------------------------------------------------------------
 * Reads
 * ------------------------------------------------------------------------ */

/** Product categories — GET /api/v1/products/categories */
export function useProductCategories(): UseQueryResult<AdminProductCategory[], Error> {
  return useQuery<AdminProductCategory[], Error>({
    queryKey: queryKeys.productCategories,
    queryFn: async () => {
      const res = await adminProductApi.getCategories();
      return res.data.data.productCategories ?? [];
    },
  });
}

/** Food pack categories — GET /api/v1/foodpacks/categories */
export function useFoodPackCategories(): UseQueryResult<FoodPackCategory[], Error> {
  return useQuery<FoodPackCategory[], Error>({
    queryKey: queryKeys.foodPackCategories,
    queryFn: async () => {
      const res = await adminFoodPackApi.getCategories();
      return res.data.data.categories ?? [];
    },
  });
}

/**
 * Every product, fetched once so each category can be counted.
 *
 * `limit: 200` is a deliberate ceiling — the API paginates and there is no
 * "count by category" endpoint, so this pulls one large page and groups it.
 * The page warns when the result hits that ceiling, because past 200 items
 * the per-category counts would silently under-report.
 */
export function useCategoryProductIndex(): UseQueryResult<AdminProduct[], Error> {
  return useQuery<AdminProduct[], Error>({
    queryKey: queryKeys.categoryProductIndex,
    queryFn: async () => {
      const res = await adminProductApi.getProducts({ limit: 200, page: 1 });
      return res.data.data.products ?? [];
    },
  });
}

/** Every food pack, same reasoning as the product index above. */
export function useCategoryFoodPackIndex(): UseQueryResult<AdminFoodPackSummary[], Error> {
  return useQuery<AdminFoodPackSummary[], Error>({
    queryKey: queryKeys.categoryFoodPackIndex,
    queryFn: async () => {
      const res = await adminFoodPackApi.getFoodPacks({ limit: 200, page: 1 });
      return res.data.data.foodpacks ?? [];
    },
  });
}

/* --------------------------------------------------------------------------
 * Writes
 * ------------------------------------------------------------------------ */

/**
 * Creates a product category. The API rejects duplicates with a 409
 * ("Category already exists"), which the screen surfaces as-is — that is a
 * useful message, unlike a generic failure toast.
 */
export function useCreateProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminProductApi.createCategory(name.trim()),
    onSuccess: () => {
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
      qc.invalidateQueries({ queryKey: queryKeys.productCategories });
      // Products embed a copy of their category name, so rename it there too.
      qc.invalidateQueries({ queryKey: queryKeys.categoryProductIndex });
    },
  });
}

export function useDeleteProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProductApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.productCategories });
      qc.invalidateQueries({ queryKey: queryKeys.categoryProductIndex });
    },
  });
}

export function useCreateFoodPackCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminFoodPackApi.createCategory(name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.foodPackCategories });
    },
  });
}

/* --------------------------------------------------------------------------
 * Derived helpers
 * ------------------------------------------------------------------------ */

export type CategoryRow = {
  id: string;
  name: string;
  /** Catalogue items currently filed under this category. Real, computed. */
  itemCount: number;
  /**
   * Sum of price × quantity for products, or price for food packs. This is
   * CATALOGUE value (what the stock is worth at list price) — it is NOT
   * revenue, and the UI labels it as such. Revenue needs a backend metric.
   */
  catalogValue: number;
  /** The items themselves, for the expandable list. */
  items: { id: string; name: string; price: number; imageUrl?: string }[];
};

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Groups the product index by category id and totals each one. */
export function buildProductCategoryRows(
  categories: AdminProductCategory[],
  products: AdminProduct[]
): CategoryRow[] {
  return categories.map((category) => {
    const inCategory = products.filter((p) => p.category?.id === category.id);

    return {
      id: category.id,
      name: category.name,
      itemCount: inCategory.length,
      catalogValue: inCategory.reduce(
        (sum, p) => sum + toNumber(p.price) * toNumber(p.quantity ?? 1),
        0
      ),
      items: inCategory.map((p) => ({
        id: p.id,
        name: p.name,
        price: toNumber(p.price),
        imageUrl: p.imageUrls?.[0],
      })),
    };
  });
}

/** Same thing for food packs — no quantity here, packs are sold as units. */
export function buildFoodPackCategoryRows(
  categories: FoodPackCategory[],
  packs: AdminFoodPackSummary[]
): CategoryRow[] {
  return categories.map((category) => {
    const inCategory = packs.filter((p) => p.category?.id === category.id);

    return {
      id: category.id,
      name: category.name,
      itemCount: inCategory.length,
      catalogValue: inCategory.reduce((sum, p) => sum + toNumber(p.price), 0),
      items: inCategory.map((p) => ({
        id: p.id,
        name: p.name,
        price: toNumber(p.price),
        imageUrl: p.imageUrls?.[0],
      })),
    };
  });
}

/**
 * True when the index hit the 200-row ceiling, meaning the counts on screen
 * are partial. The screen shows a warning when this is the case instead of
 * quietly reporting wrong totals.
 */
export const INDEX_LIMIT = 200;
export const isIndexTruncated = (rows: unknown[]) => rows.length >= INDEX_LIMIT;