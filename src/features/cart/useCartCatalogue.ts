import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { foodpackApi, type ApiFoodpack } from '../catalogue/api/foodpackApi';
import { productApi, type ApiProduct } from '../catalogue/api/productApi';

const PRODUCT_LIMIT = 100;
const FOODPACK_LIMIT = 50;

export function useCartCatalogue(enabled: boolean) {
  const products = useQuery({
    queryKey: ['catalogue', 'products', PRODUCT_LIMIT],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await productApi.getProducts({ limit: PRODUCT_LIMIT }, signal);
      return data.data.products ?? [];
    },
  });
  const packs = useQuery({
    queryKey: ['catalogue', 'foodpacks', FOODPACK_LIMIT],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await foodpackApi.getFoodpacks({ limit: FOODPACK_LIMIT }, signal);
      return data.data.foodPacks ?? [];
    },
  });

  return useMemo(() => {
    const lookup = new Map<string, ApiProduct | ApiFoodpack>();
    for (const product of products.data ?? []) lookup.set(product.id, product);
    for (const pack of packs.data ?? []) lookup.set(pack.id, pack);
    return lookup;
  }, [products.data, packs.data]);
}
