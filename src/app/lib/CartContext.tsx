import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isAuthenticated } from './auth';
import { cartApi } from './cartApi';
import { guestCart } from './guestCart';

interface CartContextValue {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  refreshCartCount: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      if (isAuthenticated()) {
        const data = await cartApi.getCart();
        setCartCount(data?.data.data.cart.cartItems?.length ?? 0);
      } else {
        setCartCount(guestCart.getItems().length);
      }
    } catch {
      // fail silently
    }
  }, []);

  // fetch on mount
  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}