import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';
import type { CategoryKind, CategoryMetrics, CategoryOption, CategoryRow } from './types';

type CategoryItem = CategoryRow['items'][number];

type CategoryOverview = CategoryOption & {
  isActive: boolean;
  catalogValue: number;
  revenueGenerated: number;
};

type ProductCategoryOverview = CategoryOverview & {
  productCount: number;
  products: CategoryItem[];
};

type FoodPackCategoryOverview = CategoryOverview & {
  foodpackCount: number;
  foodpacks: CategoryItem[];
};

type CategoryMetricsResponse = {
  numberOfCategories: number;
  numberOfProducts: number;
  totalRevenue: number;
  catalogValue: number;
};

const paths = {
  products: '/api/v1/admin/product-categories',
  'food-packs': '/api/v1/admin/foodpack-categories',
};

function numberOrZero(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toCategoryRow(
  category: CategoryOverview,
  itemCount: number,
  items: CategoryItem[],
): CategoryRow {
  return {
    id: category.id,
    name: category.name,
    itemCount: numberOrZero(itemCount),
    catalogValue: numberOrZero(category.catalogValue),
    revenueGenerated: numberOrZero(category.revenueGenerated),
    isActive: category.isActive !== false,
    items: items ?? [],
  };
}

export const categoryApi = {
  async getProductOptions() {
    const { data } = await api.get<ApiResponse<{ productCategories: CategoryOption[] }>>(
      '/api/v1/products/categories',
    );
    return data.data.productCategories ?? [];
  },

  async getFoodPackOptions() {
    const { data } = await api.get<ApiResponse<{ categories: CategoryOption[] }>>(
      '/api/v1/foodpacks/categories',
    );
    return data.data.categories ?? [];
  },

  async getOverview(kind: CategoryKind): Promise<CategoryRow[]> {
    if (kind === 'products') {
      const { data } = await api.get<ApiResponse<{ categories: ProductCategoryOverview[] }>>(
        paths.products,
      );
      return (data.data.categories ?? []).map((category) =>
        toCategoryRow(category, category.productCount, category.products),
      );
    }

    const { data } = await api.get<ApiResponse<{ foodpackCategories: FoodPackCategoryOverview[] }>>(
      paths['food-packs'],
    );
    return (data.data.foodpackCategories ?? []).map((category) =>
      toCategoryRow(category, category.foodpackCount, category.foodpacks),
    );
  },

  async getMetrics(kind: CategoryKind): Promise<CategoryMetrics> {
    const { data } = await api.get<ApiResponse<CategoryMetricsResponse>>(`${paths[kind]}/metrics`);
    const metrics = data.data;
    return {
      numberOfCategories: numberOrZero(metrics.numberOfCategories),
      numberOfItems: numberOrZero(metrics.numberOfProducts),
      totalRevenue: numberOrZero(metrics.totalRevenue),
      catalogValue: numberOrZero(metrics.catalogValue),
    };
  },

  create: (kind: CategoryKind, name: string) =>
    api.post<ApiResponse<unknown>>(paths[kind], { name: name.trim() }),

  rename: (kind: CategoryKind, id: string, name: string) =>
    api.patch<ApiResponse<unknown>>(`${paths[kind]}/${id}`, { name: name.trim() }),

  remove: (kind: CategoryKind, id: string, fallbackCategoryId: string) =>
    api.delete<ApiResponse<unknown>>(`${paths[kind]}/${id}`, {
      data: { fallbackCategoryId },
    }),
};
