import type { Cart } from '../cart/api/cartApi';
import { getTransferCharge } from '../cart/pricing';
import type { PaymentMethod } from './api/paymentApi';

const DELIVERY_FEE = 400;
const FREE_DELIVERY_MINIMUM = 3000;

export type CheckoutTotals = ReturnType<typeof calculateCheckoutTotals>;

export function calculateCheckoutTotals(cart: Cart, payment?: PaymentMethod) {
  const subtotal = Number(cart.subTotal);
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_MINIMUM - subtotal);
  const deliveryFee = subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
  const requiresUpfrontPayment = cart.cartItems.some((item) => item.acceptPaymentOnDelivery === false);
  const paysByTransfer = payment?.title?.toLowerCase().includes('transfer') ||
    payment?.description?.toLowerCase().includes('bank charges');
  const transferCharge = requiresUpfrontPayment || paysByTransfer ? getTransferCharge(subtotal) : 0;

  return {
    subtotal,
    remainingForFreeDelivery,
    deliveryFee,
    transferCharge,
    total: subtotal + deliveryFee + transferCharge,
  };
}
