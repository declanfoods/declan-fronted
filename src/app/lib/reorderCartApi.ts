import api from './axios';
import type { ApiResponse } from './api-types';

/*
|--------------------------------------------------------------------------
| Reorder Cart
|--------------------------------------------------------------------------
| This is a SEPARATE cart from /api/v1/cart. That distinction is the whole
| reason "Re-order" appeared to do nothing:
|
|   POST /api/v1/orders/:orderId/readd   → fills the REORDER cart
|   GET  /api/v1/cart                    → the MAIN cart (still empty)
|
| The app called `readd` correctly and then navigated to /app/cart, which
| reads the main cart. So the items really were added — just somewhere the
| customer was never shown. This screen is that missing place.
|
| Shapes below are taken from the collection's saved response for
| GET /api/v1/reorder-carts:
|
|   data.cart = {
|     id, itemCount, subTotal,
|     cartItems: [
|       { id, itemName, itemCategoryName, itemId, itemType,
|         itemUrls: [ "https://…" ],   ← plural, an array
|         itemPrice: "1350",           ← STRING, not a number
|         quantity }
|     ]
|   }
|
| ⚠️ The previous version of this file was written from guesswork and had
|   both field names and value types wrong (`name`, `price: number`,
|   `image: {url}`, and a non-existent `items` array). Every screen built on
|   it would have rendered blanks. These types now match the real payload.
|
| ⚠️ `itemPrice` is a string; `subTotal` and `itemCount` are numbers. Don't
|   "tidy" them into one type — that mismatch is what the API sends.
*/

export interface ReorderCartItem {
  id: string;
  itemName: string;
  itemCategoryName: string;
  /** The underlying product / foodpack id. */
  itemId: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  /** Plural, and often contains the same URL twice. May be absent. */
  itemUrls?: string[];
  /** STRING in the payload ("1350"). Use Number() before maths. */
  itemPrice: string | number;
  quantity: number;
}

export interface ReorderCart {
  id: string;
  cartItems: ReorderCartItem[];
  /** Number, unlike itemPrice. */
  subTotal: number;
  itemCount: number;
}

export interface UpdateReorderQtyPayload {
  /**
   * The API takes the number to change by, plus a direction — it does not
   * take the absolute quantity. See the collection body:
   *   { "quantity": 1, "operationType": "INCREMENT" }
   */
  quantity: number;
  operationType: 'INCREMENT' | 'DECREMENT';
}

/** First usable image for a reorder item, or null. */
export function reorderItemImage(item: ReorderCartItem): string | null {
  return item.itemUrls?.[0] ?? null;
}

/** Safe numeric price — the API sends a string. */
export function reorderItemPrice(item: ReorderCartItem): number {
  return Number(item.itemPrice ?? 0);
}

export const reorderCartApi = {
  getReorderCart: () =>
    api.get<ApiResponse<{ cart: ReorderCart }>>('/api/v1/reorder-carts'),

  updateReorderItem: (itemId: string, data: UpdateReorderQtyPayload) =>
    api.patch<ApiResponse<{ cart: ReorderCart }>>(
      `/api/v1/reorder-carts/items/${itemId}`,
      data
    ),

  removeReorderItem: (itemId: string) =>
    api.delete<ApiResponse<{ cart: ReorderCart }>>(
      `/api/v1/reorder-carts/items/${itemId}`
    ),
};