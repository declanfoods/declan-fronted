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

export type CategoryRow = {
  id: string;
  name: string;
  itemCount: number;
  catalogValue: number;
  revenueGenerated: number;
  isActive: boolean;
  items: { id: string; name: string; imageUrl?: string | null }[];
};



function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function toProductCategoryRows(
  categories: AdminCategoryOverview[]
): CategoryRow[] {
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    itemCount: toNumber(c.productCount),
    catalogValue: toNumber(c.catalogValue),
    revenueGenerated: toNumber(c.revenueGenerated),
    isActive: c.isActive !== false,
    items: c.products ?? [],
  }));
}


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


export function useProductCategoryOverview(): UseQueryResult<AdminCategoryOverview[], Error> {
  return useQuery<AdminCategoryOverview[], Error>({
    queryKey: queryKeys.productCategoryOverview,
    queryFn: async () => {
      const res = await adminProductApi.getCategoryOverview();
      return res.data.data.categories ?? [];
    },
  });
}

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

export function useProductCategoryMetrics(): UseQueryResult<CategoryMetricsView, Error> {
  return useQuery<CategoryMetricsView, Error>({
    queryKey: queryKeys.productCategoryMetrics,
    queryFn: async () => {
      const res = await adminProductApi.getCategoryMetrics();
      return toMetricsView(res.data.data);
    },
  });
}

export function useFoodPackCategoryMetrics(): UseQueryResult<CategoryMetricsView, Error> {
  return useQuery<CategoryMetricsView, Error>({
    queryKey: queryKeys.foodPackCategoryMetrics,
    queryFn: async () => {
      const res = await adminFoodPackApi.getCategoryMetrics();
      return toMetricsView(res.data.data);
    },
  });
}

export function useCreateProductCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminProductApi.createCategory(name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryOverview });
      qc.invalidateQueries({ queryKey: queryKeys.productCategoryMetrics });
   
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
      
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}



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