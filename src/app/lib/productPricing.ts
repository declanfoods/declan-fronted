/*
|--------------------------------------------------------------------------
| productPricing — turn a product's `discount` object into a real price
|--------------------------------------------------------------------------
| ⚠️ WHY THIS FILE EXISTS
|
| The API has been returning discounts on products all along, and the
| customer-facing UI has been ignoring every one of them:
|
|   GET /api/v1/products
|   {
|     "name": "speedy buiscuit",
|     "price": "70",                       ← what the card showed
|     "discount": {
|       "discountValue": 20,
|       "discountType": "fixed_discount",
|       "isExpired": false,
|       "originalPrice": "70",
|       "discountPrice": 50               ← what the customer actually pays
|     }
|   }
|
| Verified against the live server: 5 of the 8 listed products carry a
| discount, and not one of them was showing.
|
| ⚠️ THE IMPORTANT DISTINCTION
|
|   `product.price`     = the price BEFORE the discount. Not the shelf price.
|   `discount.discountPrice` = the price the customer pays.
|
| `price` and `discount.originalPrice` are the same number in all five live
| samples (300/300, 70/70, 9000/9000, 20000/20000, 300/300), so either can be
| used as the struck-through figure. `originalPrice` is preferred since it is
| the backend's own statement of it, with `price` as the fallback.
|
| None of the live samples come back expired, but the flag is checked anyway —
| a dead discount that still shows is the same bug wearing a hat.
|
| Foodpacks do NOT use this: they carry flat `originalPrice` / `amountOff` /
| `amounOffInPercent` fields instead, and `FoodPackCard` already reads those
| correctly. The asymmetric payloads are a backend quirk, not a frontend one;
| both shapes are handled on their own terms rather than normalised into one.
|
| ⚠️ `toNumberOrNull` returns null for junk rather than NaN, so a card can
|    fall back to the raw value instead of printing "₦NaN".
*/

/** The `discount` object as it arrives on a product. Every field is optional. */
export interface DiscountLike {
  discountValue?: number | null;
  discountType?: string | null;
  isExpired?: boolean | null;
  originalPrice?: string | number | null;
  discountPrice?: string | number | null;
}

/** Anything priceable: `ApiProduct`, `AdminProduct`, a foodpack, whatever. */
export interface PriceShape {
  price: string | number;
  discount?: DiscountLike | null;
}

export interface EffectivePrice {
  /** What the customer pays. Use this anywhere a single price is shown. */
  price: number;
  /** The pre-discount price, for the struck-through line. */
  originalPrice: number;
  /** How much comes off, in naira. 0 when there is no live discount. */
  discountAmount: number;
  /** Whole-number percentage off, computed from the two prices above. */
  percentOff: number;
  /** True only when a live discount actually lowers the price. */
  isDiscounted: boolean;
  /** e.g. "₦20 off" / "20% off" / "". Safe to render as-is. */
  label: string;
}

/** Parse anything into a number, or null if it is not one. Never NaN. */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** A discount that exists and has not expired. */
export function isLiveDiscount(discount?: DiscountLike | null): boolean {
  if (!discount) return false;
  if (discount.isExpired === true) return false;
  const value = toNumberOrNull(discount.discountValue);
  const fixedPrice = toNumberOrNull(discount.discountPrice);
  return value !== null || fixedPrice !== null;
}

/**
 * Resolve a product into the price to show and the price to strike through.
 *
 * Prefers the backend's own `discountPrice`. Only computes the discount
 * itself when that field is missing, since a percentage and a fixed amount
 * need different arithmetic and guessing wrong would misprice the item.
 */
export function getEffectivePrice(product?: PriceShape | null): EffectivePrice {
  const listPrice = toNumberOrNull(product?.price) ?? 0;
  const flat: EffectivePrice = {
    price: listPrice,
    originalPrice: listPrice,
    discountAmount: 0,
    percentOff: 0,
    isDiscounted: false,
    label: '',
  };

  const discount = product?.discount;
  if (!isLiveDiscount(discount)) return flat;

  const original = toNumberOrNull(discount?.originalPrice) ?? listPrice;

  let payable = toNumberOrNull(discount?.discountPrice);

  if (payable === null) {
    // No discountPrice sent — derive it from the type, never assume fixed.
    const value = toNumberOrNull(discount?.discountValue) ?? 0;
    const isPercent =
      (discount?.discountType ?? '').toLowerCase().includes('percent');
    payable = isPercent
      ? original - (original * value) / 100
      : original - value;
  }

  // A "discount" that raises the price, or one rounding to nothing, is not a
  // discount worth showing.
  if (payable >= original) return flat;

  const discountAmount = original - payable;
  const percentOff = original > 0 ? Math.round((discountAmount / original) * 100) : 0;

  const isPercent =
    (discount?.discountType ?? '').toLowerCase().includes('percent');
  const value = toNumberOrNull(discount?.discountValue) ?? 0;

  return {
    price: payable,
    originalPrice: original,
    discountAmount,
    percentOff,
    isDiscounted: true,
    label: isPercent
      ? `${Math.round(value)}% off`
      : `₦${discountAmount.toLocaleString('en-NG')} off`,
  };
}

/**
 * The discounted unit price for a product, as a plain number.
 *
 * Exists for the places that build a cart line rather than render one — a
 * card must not put the pre-discount price into the cart, or the customer is
 * told one price and charged another.
 */
export function discountedUnitPrice(product?: PriceShape | null): number {
  return getEffectivePrice(product).price;
}
