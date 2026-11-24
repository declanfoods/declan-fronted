import { isAuthenticated } from '../auth/session';
import type { ApiFoodpack } from '../catalogue/api/foodpackApi';
import type { ApiProduct } from '../catalogue/api/productApi';
import { getEffectiveFoodpackPrice, getEffectivePrice } from '../catalogue/pricing';
import { refreshAccountCart, resetCartQueries } from './accountCart';
import { cartApi } from './api/cartApi';
import { guestCart } from './guestCart';

export async function addProductToCart(product: ApiProduct, quantity = 1) {
  if (isAuthenticated()) {
    await cartApi.addItem({ productId: product.id, quantity });
    await refreshAccountCart();
    return;
  }

  guestCart.addItem({
    id: product.id,
    itemId: product.id,
    itemType: 'PRODUCT',
    itemName: product.name,
    itemCategoryName: product.category?.name ?? 'Product',
    itemUrls: product.imageUrls ?? [],
    itemPrice: String(getEffectivePrice(product).price),
    acceptPaymentOnDelivery: product.acceptPaymentOnDelivery,
    discount: product.discount,
  }, quantity);
}

export async function addFoodPackToCart(pack: ApiFoodpack, quantity = 1) {
  if (isAuthenticated()) {
    await cartApi.addItem({ foodpackId: pack.id, quantity });
    await refreshAccountCart();
    return;
  }

  guestCart.addItem({
    id: pack.id,
    itemId: pack.id,
    itemType: 'FOODPACK',
    itemName: pack.name,
    itemCategoryName: 'Food Pack',
    itemUrls: pack.imageUrls ?? [],
    itemPrice: String(getEffectiveFoodpackPrice(pack).price),
    acceptPaymentOnDelivery: pack.acceptPaymentOnDelivery,
  }, quantity);
}

export async function mergeGuestCartAfterLogin() {
  resetCartQueries();
  const items = guestCart.getItems();
  if (items.length === 0) return;

  await cartApi.mergeCart(items.map(({ itemType, itemId, quantity }) => ({
    productId: itemType === 'PRODUCT' ? itemId : undefined,
    foodPackId: itemType === 'FOODPACK' ? itemId : undefined,
    quantity,
  })));
  guestCart.removeQuantities(items);
}
