import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, type ApiProduct } from '../lib/productApi';
import { foodpackApi, type ApiFoodpack } from '../lib/foodpackApi';
import {
  getCataloguePrice,
  type EffectivePrice,
} from '../lib/productPricing';
import type { CartItem } from '../lib/cartApi';

/*
|--------------------------------------------------------------------------
| useCartCatalogue — what the cart needs to SHOW a discount
|--------------------------------------------------------------------------
| ⚠️ WHY THIS EXISTS
|
| A cart line carries exactly one price:
|
|   { "itemId": "2969b80b-…", "itemType": "PRODUCT",
|     "itemPrice": "300", "quantity": 5 }
|
| That is all. There is no `originalPrice`, no `discount`, nothing to strike
| through and nothing to build a "% OFF" badge from — which is why a cart line
| for a discounted product looked exactly like a cart line for a full-price
| one. The discount was invisible for both signed-in and guest customers.
|
| The cart response is not going to grow those fields (it is the same shape on
| the customer and the reorder endpoints), so the missing half is reconstructed
| from the catalogue: the public product and food pack lists, keyed by the
| `itemId` the cart line already provides.
|
| ⚠️ THIS IS DISPLAY-ONLY DATA. IT NEVER OVERRIDES WHAT IS CHARGED.
|
| The unit price stays `item.itemPrice` — for a signed-in customer that is the
| server's number, and the server computes the subtotal from it. Showing a
| different figure here would leave a total that does not add up, which is
| worse than showing no discount at all.
|
| So the catalogue supplies the COMPARISON, not the price:
|
|   catalogue original 70, cart price 50  ->  "₦50  ₦70  29% OFF"   ✓ discounted
|   catalogue original 70, cart price 70  ->  "₦70"                 no badge
|
| The second case is the honest one: if the server is not applying the
| discount to the cart line, the customer is going to be charged the full
| price, and the cart should not claim otherwise. It is question 1 of section
| 7 in the backend message.
|
| ⚠️ One fetch for the whole cart, not one per line. Both lists are public
| (no auth needed) and cached hard, so opening the cart costs two requests the
| first time and none afterwards.
|
| ⚠️ THE TWO LISTS HAVE DIFFERENT LIMITS, AND GUESSING WRONG FAILS SILENTLY
|
| Verified against the live server:
|
|   GET /products?limit=100   ->  200
|   GET /foodpacks?limit=100  ->  400  "limit must not be greater than 50"
|   GET /foodpacks?limit=50   ->  200
|
| Food packs cap at 50, products at least 100. Using one number for both means
| the food pack list 400s, the lookup comes back empty, and every food pack in
| the cart quietly renders at full price with no badge — which looks exactly
| like "the discount isn't working" rather than like an error.
|
| So they are two separate constants below. If a 400 ever reappears here, that
| is the first thing to check.
|
| A cart line whose item is past either cut resolves to "no discount known" and
| renders at its plain price rather than breaking.
*/

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
    const entry = lookup.get(item.itemId);

    if (!entry) {
      return {
        price: unitPrice,
        originalPrice: unitPrice,
        discountAmount: 0,
        percentOff: 0,
        isDiscounted: false,
        label: '',
        hasCatalogueDiscount: false,
      };
    }

    const catalogue = getCataloguePrice(entry, item.itemType);

    /*
      The cart is only showing a discount when it is charging LESS than the
      catalogue's pre-discount price. If those are equal, the discount exists
      in the catalogue but is not being applied to this line.
    */
    const isDiscounted = unitPrice < catalogue.originalPrice;

    return {
      price: unitPrice,
      originalPrice: catalogue.originalPrice,
      discountAmount: isDiscounted ? catalogue.originalPrice - unitPrice : 0,
      percentOff: isDiscounted
        ? Math.round(
            ((catalogue.originalPrice - unitPrice) / catalogue.originalPrice) * 100
          )
        : 0,
      isDiscounted,
      label: isDiscounted ? catalogue.label : '',
      hasCatalogueDiscount: catalogue.isDiscounted,
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
