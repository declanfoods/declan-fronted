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

/*
|--------------------------------------------------------------------------
| FIX: "limit must not be greater than 100"
|--------------------------------------------------------------------------
| The food pack tab failed on load with that validation error while the
| product tab worked. Cause: this file asked for `limit: 200` on BOTH indexes.
| The foodpack endpoint caps `limit` at 100 and rejects anything higher, so
| the whole screen errored before it could render a single category.
|
| The product endpoint tolerated 200, which is why only one tab broke — but
| relying on that difference is exactly the kind of thing that breaks again
| later, so both now fetch in pages of 100.
|
| Paging rather than lowering the number to 100 and stopping: with a single
| page, a catalogue of 250 items would silently report wrong per-category
| counts. This walks the pages and only gives up at INDEX_MAX_PAGES, at which
| point it says so on screen instead of quietly under-reporting.
*/

/** The server's hard cap on `limit` for these endpoints. Do not raise it. */
export const INDEX_PAGE_SIZE = 100;

/** Safety stop — 10 pages = 1000 catalogue items. */
export const INDEX_MAX_PAGES = 10;

export type CategoryIndex<T> = {
  items: T[];
  /** True when the walk stopped at INDEX_MAX_PAGES before the last page. */
  truncated: boolean;
  pagesFetched: number;
};

/**
 * Walks every page of a paginated admin list and returns the lot.
 *
 * `hasNextPage` is taken from the response's pagination block. When that block
 * is missing (it is on some endpoints), it falls back to "the page came back
 * full, so there is probably more" — which is safe because the loop is capped.
 */
async function fetchAllPages<T>(
  fetchPage: (
    page: number
  ) => Promise<{ items: T[]; hasNextPage?: boolean }>
): Promise<CategoryIndex<T>> {
  const items: T[] = [];
  let page = 1;

  while (page <= INDEX_MAX_PAGES) {
    const { items: pageItems, hasNextPage } = await fetchPage(page);

    items.push(...pageItems);

    const more = hasNextPage ?? pageItems.length >= INDEX_PAGE_SIZE;

    if (!more || pageItems.length === 0) {
      return { items, truncated: false, pagesFetched: page };
    }

    page += 1;
  }

  return { items, truncated: true, pagesFetched: INDEX_MAX_PAGES };
}

/**
 * Every product, so each category can be counted.
 *
 * There is no "count by category" endpoint, so the client groups the full
 * list. Paged at INDEX_PAGE_SIZE because asking for more than the server's cap
 * is a hard 400.
 */
export function useCategoryProductIndex(): UseQueryResult<CategoryIndex<AdminProduct>, Error> {
  return useQuery<CategoryIndex<AdminProduct>, Error>({
    queryKey: queryKeys.categoryProductIndex,
    queryFn: () =>
      fetchAllPages<AdminProduct>(async (page) => {
        const res = await adminProductApi.getProducts({
          limit: INDEX_PAGE_SIZE,
          page,
        });

        return {
          items: res.data.data.products ?? [],
          hasNextPage: res.data.data.pagination?.hasNextPage,
        };
      }),
  });
}

/** Every food pack, same reasoning and same page size as the products index. */
export function useCategoryFoodPackIndex(): UseQueryResult<
  CategoryIndex<AdminFoodPackSummary>,
  Error
> {
  return useQuery<CategoryIndex<AdminFoodPackSummary>, Error>({
    queryKey: queryKeys.categoryFoodPackIndex,
    queryFn: () =>
      fetchAllPages<AdminFoodPackSummary>(async (page) => {
        const res = await adminFoodPackApi.getFoodPacks({
          limit: INDEX_PAGE_SIZE,
          page,
        });

        return {
          items: res.data.data.foodpacks ?? [],
          hasNextPage: res.data.data.pagination?.hasNextPage,
        };
      }),
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
 * True when a page walk stopped at INDEX_MAX_PAGES, meaning the counts on
 * screen are partial. The screen warns when this is the case instead of
 * quietly reporting wrong totals.
 */
export const isIndexTruncated = (index?: { truncated: boolean }) =>
  index?.truncated ?? false;