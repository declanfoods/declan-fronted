import type { ApiFoodpack } from '../api/foodpackApi';
import type { ApiProduct, ProductCategory } from '../api/productApi';
import type { PriceRangeKey, ProductFilterState } from '../filters';

export const shopTabs = [
  { key: 'all', label: 'All' },
  { key: 'foodstuffs', label: 'Foodstuffs' },
  { key: 'fast-food', label: 'Fast food' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'discount-packs', label: 'Discount packs' },
] as const;

export type ShopTab = (typeof shopTabs)[number]['key'];

export function matchesShopTab(name: string | null | undefined, tab: ShopTab): boolean {
  const normalized = (name ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const isFastFood = normalized.includes('cooked');
  const isDrinks = normalized.includes('drink');
  const isSnacks = normalized.includes('snack') || normalized.includes('biscuit');

  switch (tab) {
    case 'all':
      return true;
    case 'foodstuffs':
      return !isFastFood && !isDrinks && !isSnacks;
    case 'fast-food':
      return isFastFood;
    case 'drinks':
      return isDrinks;
    case 'snacks':
      return isSnacks;
    case 'discount-packs':
      return false;
  }
}

function matchesPriceRange(price: number, ranges: PriceRangeKey[]): boolean {
  return ranges.length === 0 || ranges.some((range) => {
    switch (range) {
      case '0-5000':
        return price >= 0 && price <= 5000;
      case '5000-10000':
        return price > 5000 && price <= 10000;
      case '10000+':
        return price > 10000;
    }
  });
}

export function filterShopProducts(
  products: ApiProduct[],
  categories: ProductCategory[],
  tab: ShopTab,
  subcategory: string | null,
  filters: ProductFilterState,
): ApiProduct[] {
  const categoryNames = new Map(categories.map(({ id, name }) => [id, name]));

  return products.filter((product) => {
    const categoryId = product.category?.id ?? '';
    const categoryName = product.category?.name || categoryNames.get(categoryId) || '';

    if (!matchesShopTab(categoryName, tab) || (subcategory && categoryId !== subcategory)) {
      return false;
    }
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(categoryId)) {
      return false;
    }
    if (!matchesPriceRange(Number(product.price), filters.priceRanges)) {
      return false;
    }
    if (filters.availability.length === 0 || product.quantity === undefined) {
      return true;
    }

    return filters.availability.includes(product.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK');
  });
}

export function filterShopFoodPacks(
  foodPacks: ApiFoodpack[],
  priceRanges: PriceRangeKey[],
): ApiFoodpack[] {
  return foodPacks.filter((pack) => matchesPriceRange(Number(pack.price), priceRanges));
}
