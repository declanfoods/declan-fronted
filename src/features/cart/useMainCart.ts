import { useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../app/lib/api-types';
import { isAuthenticated } from '../auth/session';
import { getCataloguePrice } from '../catalogue/pricing';
import { refreshAccountCart, useAccountCart } from './accountCart';
import { cartApi, type CartItem } from './api/cartApi';
import { guestCart } from './guestCart';
import { useCartCatalogue } from './useCartCatalogue';
import { useGuestCart } from './useGuestCart';

export function useMainCart() {
  const authenticated = isAuthenticated();
  const account = useAccountCart(authenticated);
  const guest = useGuestCart();
  const catalogue = useCartCatalogue(!authenticated && guest.cartItems.length > 0);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState('');
  const inFlight = useRef(false);

  useEffect(() => {
    if (authenticated || catalogue.size === 0) return;
    const prices = new Map<string, number>();
    for (const item of guest.cartItems) {
      const entry = catalogue.get(item.itemId);
      if (entry) prices.set(item.itemId, getCataloguePrice(entry, item.itemType).price);
    }
    guestCart.syncPrices(prices);
  }, [authenticated, catalogue, guest.cartItems]);

  async function runAction(
    itemId: string | null,
    accountAction: () => Promise<unknown>,
    guestAction: () => void,
    fallback: string,
  ) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPendingItem(itemId);
    setClearing(itemId === null);
    setActionError('');
    try {
      if (authenticated) {
        await accountAction();
        await refreshAccountCart();
      } else {
        guestAction();
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error, fallback));
    } finally {
      setPendingItem(null);
      setClearing(false);
      inFlight.current = false;
    }
  }

  return {
    cart: authenticated ? account.data : guest,
    loading: authenticated && account.isPending,
    error: authenticated && account.isError ? getApiErrorMessage(account.error, 'Failed to load cart.') : '',
    retry: () => account.refetch(),
    pendingItem,
    clearing,
    actionError,
    updateQuantity: (item: CartItem, delta: 1 | -1) => runAction(
      item.id,
      () => cartApi.updateItemQty(item.id, {
        quantity: 1,
        operationType: delta === 1 ? 'INCREMENT' : 'DECREMENT',
      }),
      () => guestCart.setQty(item.id, item.quantity + delta),
      'Could not update that item.',
    ),
    removeItem: (itemId: string) => runAction(
      itemId,
      () => cartApi.removeItem(itemId),
      () => guestCart.removeItem(itemId),
      'Could not remove that item.',
    ),
    clearCart: () => runAction(null, cartApi.clearCart, guestCart.clear, 'Could not clear the cart.'),
  };
}
