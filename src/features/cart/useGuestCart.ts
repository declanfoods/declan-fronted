import { useMemo, useSyncExternalStore } from 'react';
import { guestCart } from './guestCart';

export function useGuestCart() {
  const snapshot = useSyncExternalStore(guestCart.onChange, guestCart.readSnapshot);
  return useMemo(() => guestCart.toCart(snapshot), [snapshot]);
}
