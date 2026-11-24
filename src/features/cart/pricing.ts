import type { EffectivePrice } from '../catalogue/pricing';
import type { CartItem } from './api/cartApi';

export function getCartLinePricing(item: CartItem): EffectivePrice {
  const price = Number(item.itemPrice) || 0;
  const discount = item.discount;
  if (!discount) {
    return { price, originalPrice: price, discountAmount: 0, percentOff: 0, isDiscounted: false, label: '' };
  }

  const originalPrice = Number(discount.originalPrice);
  const value = Number(discount.discountValue) || 0;
  return {
    price,
    originalPrice,
    discountAmount: originalPrice - discount.discountPrice,
    percentOff: value,
    isDiscounted: true,
    label: discount.discountType?.includes('percent')
      ? `${Math.round(value)}% off`
      : `₦${value.toLocaleString('en-NG')} off`,
  };
}

export function getTransferCharge(amount: number): number {
  if (amount >= 30_000) return 150;
  if (amount >= 10_000) return 100;
  return 50;
}
