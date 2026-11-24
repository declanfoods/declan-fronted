import { useSyncExternalStore } from 'react';
import { isAuthenticated } from '../auth/session';
import { useAccountCart } from './accountCart';
import { guestCart } from './guestCart';

export function useCartCount() {
  const authenticated = isAuthenticated();
  const account = useAccountCart(authenticated);
  const guestLineCount = useSyncExternalStore(guestCart.onChange, guestCart.getLineCount);

  return authenticated ? account.data?.cartItems?.length ?? 0 : guestLineCount;
}
