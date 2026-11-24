import { useQuery } from '@tanstack/react-query';
import { adminFoodPackApi, type FoodPackFilters } from './api/adminFoodPackApi';
import { adminGeneralDiscountApi } from './api/adminGeneralDiscountApi';
import { adminProductApi, type AdminProductFilters } from './api/adminProductApi';
import { adminStockApi } from './api/adminStockApi';
import { inventoryKey } from './cache';

export function useInventoryProducts(hidden: boolean, filters: AdminProductFilters) {
  return useQuery({
    queryKey: [...inventoryKey, 'products', hidden ? 'hidden' : filters],
    retry: false,
    queryFn: async ({ signal }) => {
      if (hidden) {
        const { data } = await adminProductApi.getHiddenProducts(signal);
        return { products: data.data.products ?? [], pagination: null };
      }
      const { data } = await adminProductApi.getProducts(filters, signal);
      return { products: data.data.products ?? [], pagination: data.data.pagination };
    },
  });
}

export function useInventoryFoodPacks(filters: FoodPackFilters) {
  return useQuery({
    queryKey: [...inventoryKey, 'food-packs', filters],
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await adminFoodPackApi.getFoodPacks(filters, signal);
      return data.data.foodpacks ?? [];
    },
  });
}

export function useInventoryStockHistory(page: number, limit: number, productId?: string) {
  const filters = { page, limit };
  return useQuery({
    queryKey: [...inventoryKey, 'stock', productId, filters],
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = productId
        ? await adminStockApi.getProductHistory(productId, filters, signal)
        : await adminStockApi.getAllHistory(filters, signal);
      return data.data;
    },
  });
}

export function useInventoryDiscounts(page: number, limit: number) {
  return useQuery({
    queryKey: [...inventoryKey, 'discounts', { page, limit }],
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await adminGeneralDiscountApi.getDiscounts({ page, limit }, signal);
      return data.data;
    },
  });
}
