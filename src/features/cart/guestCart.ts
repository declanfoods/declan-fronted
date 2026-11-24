import type { Cart, CartItem } from './api/cartApi';

const STORAGE_KEY = 'guestCart';
const UPDATE_EVENT = 'guest-cart-updated';

function readSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readItems(snapshot = readSnapshot()): CartItem[] {
  try {
    const items: unknown = JSON.parse(snapshot ?? '[]');
    if (!Array.isArray(items)) return [];
    return items.filter((item): item is CartItem =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export const guestCart = {
  onChange(callback: () => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) callback();
    };
    window.addEventListener(UPDATE_EVENT, callback);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(UPDATE_EVENT, callback);
      window.removeEventListener('storage', onStorage);
    };
  },

  readSnapshot,
  getItems: readItems,
  getLineCount: () => readItems().length,

  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const items = readItems();
    const existing = items.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ ...item, quantity });
    }
    write(items);
  },

  setQty(itemId: string, quantity: number) {
    write(readItems()
      .map((item) => item.id === itemId ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0));
  },

  removeItem: (itemId: string) => write(readItems().filter((item) => item.id !== itemId)),
  clear: () => write([]),

  syncPrices(prices: ReadonlyMap<string, number>) {
    let changed = false;
    const items = readItems().map((item) => {
      const price = prices.get(item.itemId);
      if (price === undefined || Number(item.itemPrice) === price) return item;
      changed = true;
      return { ...item, itemPrice: String(price) };
    });
    if (changed) write(items);
  },

  // Keep additions made while a merge or order request was in flight.
  removeQuantities(submittedItems: CartItem[]) {
    const submittedQuantities = new Map(submittedItems.map((item) => [item.id, item.quantity]));
    write(readItems()
      .map((item) => ({ ...item, quantity: item.quantity - (submittedQuantities.get(item.id) ?? 0) }))
      .filter((item) => item.quantity > 0));
  },

  toCart(snapshot = readSnapshot()): Cart {
    const items = readItems(snapshot);
    return {
      id: 'guest-cart',
      cartItems: items,
      subTotal: items.reduce((sum, item) => sum + Number(item.itemPrice) * item.quantity, 0),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
};
