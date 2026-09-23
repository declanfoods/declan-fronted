import type { CartItem, Cart } from './cartApi';

const STORAGE_KEY = 'guestCart';
const UPDATE_EVENT = 'guest-cart-updated';

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export const guestCart = {
  /** Subscribe to cart changes (e.g. to refresh a cart-count badge). */
  onChange: (cb: () => void) => {
    window.addEventListener(UPDATE_EVENT, cb);
    return () => window.removeEventListener(UPDATE_EVENT, cb);
  },

  getItems: (): CartItem[] => read(),

  getCount: (): number => read().reduce((sum, i) => sum + i.quantity, 0),

  /** id should be the product/foodpack id — used as the local cart-item id too. */
  addItem: (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    const items = read();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ ...item, quantity: qty });
    }
    write(items);
  },

  setQty: (itemId: string, quantity: number) => {
    const items = read()
      .map((i) => (i.id === itemId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    write(items);
  },

  removeItem: (itemId: string) => {
    write(read().filter((i) => i.id !== itemId));
  },

  clear: () => write([]),

  /**
   * Reconcile stored unit prices against the live catalogue.
   *
   * ⚠️ WHY THIS IS NECESSARY FOR A GUEST
   *
   * There is no server cart for a signed-out visitor — this localStorage list
   * IS the cart, and checkout totals straight off `itemPrice`. So a price
   * saved at the time an item was added is the price the guest is asked to
   * pay, however long ago that was.
   *
   * That makes guest carts go stale in two ways:
   *
   *   1. An item added before the discount fix still holds the PRE-discount
   *      price, so the guest would be charged 70 for something selling at 50.
   *   2. An admin changing a price or a discount never reaches a guest's
   *      stored list at all.
   *
   * The catalogue is the authority for guests, so this rewrites any line whose
   * stored price disagrees with it. Only the price is touched — quantities,
   * order and ids are left exactly as they are.
   *
   * @param prices itemId -> the price a customer pays today
   * @returns true if anything changed, so the caller can re-read the cart
   */
  syncPrices: (prices: Map<string, number>): boolean => {
    const items = read();
    let changed = false;

    const next = items.map((item) => {
      const current = prices.get(item.itemId);
      if (current === undefined) return item;                 // unknown item — leave alone
      if (Number(item.itemPrice) === current) return item;    // already right

      changed = true;
      return { ...item, itemPrice: String(current) };
    });

    if (changed) write(next);
    return changed;
  },

  toCart: (): Cart => {
    const items = read();
    const subTotal = items.reduce((sum, i) => sum + Number(i.itemPrice) * i.quantity, 0);
    return {
      id: 'guest-cart',
      cartItems: items,
      subTotal,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  },

  /** Shape expected by POST /api/v1/orders/guest items array. */
  toGuestOrderItems: () =>
    read().map((i) => ({
      itemType: i.itemType,
      itemId: i.itemId,
      quantity: i.quantity,
    })),

  /** Shape expected by POST /api/v1/cart/merge once the guest logs in. */
  toMergePayload: () =>
    read().map((i) => ({
      productId: i.itemType === 'PRODUCT' ? i.itemId : undefined,
      foodPackId: i.itemType === 'FOODPACK' ? i.itemId : undefined,
      quantity: i.quantity,
    })),
};
