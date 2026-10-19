import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, type ApiProduct } from '../lib/productApi';
import { foodpackApi, type ApiFoodpack } from '../lib/foodpackApi';
import {
  type EffectivePrice,
} from '../lib/productPricing';
import type { CartItem } from '../lib/cartApi';


export interface CartLinePricing extends EffectivePrice {
  /** True when the catalogue knows this item and says it is discounted. */
  hasCatalogueDiscount: boolean;
}

/*
  ⚠️ Different on purpose — see the note above. Food packs reject anything over
  50 with a 400, and a 400 here is silent: the list is empty, so no food pack
  ever shows a discount.
*/
const PRODUCT_LIMIT = 100;
const FOODPACK_LIMIT = 50;

export function useCartCatalogue() {
  const productsQuery = useQuery({
    queryKey: ['catalogue', 'products', PRODUCT_LIMIT],
    queryFn: async () => {
      const res = await productApi.getProducts({ limit: PRODUCT_LIMIT });
      return res.data.data.products ?? [];
    },
    // Catalogue prices change when an admin edits a discount, not mid-session.
    staleTime: 5 * 60_000,
  });

  const packsQuery = useQuery({
    queryKey: ['catalogue', 'foodpacks', FOODPACK_LIMIT],
    queryFn: async () => {
      const res = await foodpackApi.getFoodpacks({ limit: FOODPACK_LIMIT });
      return res.data.data.foodPacks ?? [];
    },
    staleTime: 5 * 60_000,
  });

  /*
    itemId -> the catalogue entry, so a cart line can be looked up in O(1).
    Products and food packs share one map: their ids are uuids and do not
    collide, and a cart line's `itemType` decides which resolver is used.
  */
  const lookup = useMemo(() => {
    const map = new Map<string, ApiProduct | ApiFoodpack>();
    for (const p of productsQuery.data ?? []) map.set(p.id, p);
    for (const p of packsQuery.data ?? []) map.set(p.id, p);
    return map;
  }, [productsQuery.data, packsQuery.data]);

  /*
    Resolve one cart line. `unitPrice` is authoritative — always the cart's own
    figure. `originalPrice` and `percentOff` come from the catalogue and are
    only meaningful when `hasCatalogueDiscount` is true AND the cart is
    actually charging less than the original.
  */
  const resolveLine = (item: CartItem): CartLinePricing => {
    const unitPrice = Number(item.itemPrice) || 0;

    const isDiscounted = item.discount ? true : false;
    console.log("Fetched:")
    console.log(item.discount)
    const label = item.discount?.discountType.includes("percent")
      ? `${Math.round(item.discount.discountValue)}% off`
      : `₦${item.discount?.discountValue.toLocaleString('en-NG')} off`

    return {
      price: unitPrice,
      originalPrice: item.discount ? +(item.discount.originalPrice) : +(item.itemPrice),
      discountAmount: item.discount ? +item.discount.originalPrice - item.discount.discountPrice : 0,
      percentOff: item.discount?.discountValue ?? 0,
      isDiscounted,
      label: label,
      hasCatalogueDiscount: isDiscounted,
    };
  };

  return {
    resolveLine,
    /** The raw catalogue entry for an id, for callers that need the source. */
    catalogueEntryFor: (itemId: string) => lookup.get(itemId),
    /** True while either catalogue list is still loading. */
    isLoading: productsQuery.isLoading || packsQuery.isLoading,
    /** True when the item is not in the first page of the catalogue. */
    isUnknown: (item: CartItem) => !lookup.has(item.itemId),
  };
}
