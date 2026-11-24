import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { discountApi } from '../api/discountApi';
import { foodpackApi } from '../api/foodpackApi';
import { productApi } from '../api/productApi';

type Page<T> = { items: T[]; totalPages: number };

const PRODUCT_PAGE_LIMIT = 100;
const FOOD_PACK_PAGE_LIMIT = 50;

async function fetchAllPages<T>(fetchPage: (page: number) => Promise<Page<T>>): Promise<T[]> {
  const firstPage = await fetchPage(1);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      fetchPage(index + 2),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.items);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function useShopItems(search: string) {
  return useQuery({
    queryKey: ['catalogue', 'shop', search],
    placeholderData: keepPreviousData,
    retry: false,
    queryFn: async ({ signal }) => {
      const [products, foodPacks] = await Promise.all([
        fetchAllPages(async (page) => {
          const { data } = await productApi.getProducts(
            { page, limit: PRODUCT_PAGE_LIMIT, search: search || undefined },
            signal,
          );
          return {
            items: data.data.products ?? [],
            totalPages: data.data.pagination.totalPages ?? 1,
          };
        }),
        fetchAllPages(async (page) => {
          const { data } = await foodpackApi.getFoodpacks(
            { page, limit: FOOD_PACK_PAGE_LIMIT, search: search || undefined },
            signal,
          );
          return {
            items: data.data.foodPacks ?? [],
            totalPages: data.data.pagination.totalPages ?? 1,
          };
        }),
      ]);

      return { products: shuffle(products), foodPacks: shuffle(foodPacks) };
    },
  });
}

export function useShopMetadata() {
  const categories = useQuery({
    queryKey: ['catalogue', 'product-categories'],
    retry: false,
    queryFn: async () => {
      const { data } = await productApi.getCategories();
      return data.data.productCategories ?? [];
    },
  });
  const discount = useQuery({
    queryKey: ['catalogue', 'discount'],
    retry: false,
    queryFn: async () => {
      const { data } = await discountApi.getCurrentDiscount();
      return data.data.discount ?? null;
    },
  });

  return { categories: categories.data, discount: discount.data };
}
