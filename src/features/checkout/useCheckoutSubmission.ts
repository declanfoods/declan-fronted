import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../app/lib/api-types';
import { orderApi } from '../orders/api/orderApi';
import { useToast } from '../../shared/ui/Toast';
import { refreshAccountCart } from '../cart/accountCart';
import type { CartItem } from '../cart/api/cartApi';
import { guestCart } from '../cart/guestCart';
import { guestCheckoutApi } from './api/guestCheckoutApi';

export type GuestDetails = {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  state: string;
  landmark: string;
};

type OrderDetails = { paymentMethodId: string; instructions: string };
type OrderRequest = OrderDetails & (
  | { kind: 'guest'; details: GuestDetails; items: CartItem[] }
  | { kind: 'account'; addressId: string }
);

export function useCheckoutSubmission() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [placing, setPlacing] = useState(false);
  const [guestOrder, setGuestOrder] = useState<{ email: string; orderNumber: string | null } | null>(null);
  const inFlight = useRef(false);

  async function placeOrder(request: OrderRequest) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPlacing(true);
    const payment = { paymentMethodId: request.paymentMethodId };
    const deliveryInstructions = request.instructions || undefined;

    try {
      if (request.kind === 'guest') {
        const { details, items } = request;
        const { data } = await guestCheckoutApi.create({
          payment,
          deliveryInstructions,
          items: items.map(({ itemType, itemId, quantity }) => ({ itemType, itemId, quantity })),
          deliveryAddress: {
            addressLine: details.addressLine.trim(),
            state: details.state.trim() || undefined,
            landmark: details.landmark.trim() || undefined,
            nameOfCustomer: details.name.trim(),
            phoneNumber: details.phone.trim(),
          },
          emailAddress: details.email.trim(),
        });

        setGuestOrder({
          orderNumber: data?.data?.order?.orderNumber || null,
          email: details.email.trim(),
        });
        try {
          guestCart.removeQuantities(items);
        } catch {
          showToast('Your order was placed. Could not update the cart on this device.', 'info');
        }
      } else {
        const { data } = await orderApi.createOrder({
          payment,
          deliveryInstructions,
          deliveryAddressId: request.addressId,
        });
        void refreshAccountCart();
        const orderId = data?.data?.order?.id;
        navigate(orderId ? `/app/orders/${orderId}/tracking` : '/app/orders');
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to place order. Please try again.'), 'error');
    } finally {
      inFlight.current = false;
      setPlacing(false);
    }
  }

  return { placeOrder, placing, guestOrder };
}
