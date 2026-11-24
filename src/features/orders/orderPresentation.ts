import { getTransferCharge } from '../cart/pricing';
import type { Order, OrderDetailsPayload, OrderTimelineEvent } from './api/orderApi';

export function orderStatusKey(status?: string) {
  return (status ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

export function orderStatusLabel(status?: string) {
  return orderStatusKey(status).replace(/_/g, ' ') || 'UNKNOWN';
}

export function isOrderDelivered(status?: string) {
  return ['DELIVERED', 'COMPLETED'].includes(orderStatusKey(status));
}

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatOrderTime(value: string | Date | null | undefined) {
  return parseDate(value)?.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) ?? 'N/A';
}

export function formatOrderDate(
  order: Order,
  timeline = order.orderTimeline ?? [],
  includeTime = false,
) {
  const candidates = [
    order.createdAt,
    timeline.find((step) => /order\s*placed/i.test(step.label ?? ''))?.passedAt,
    timeline.find((step) => step.passedAt)?.passedAt,
  ];
  const date = candidates.map(parseDate).find((value) => value !== null);
  if (!date) return null;
  if (includeTime) return formatOrderTime(date);

  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getOrderTimeline(details: OrderDetailsPayload) {
  return details.orderTimeline ?? details.order?.orderTimeline ?? [];
}

export function orderProgress(timeline: OrderTimelineEvent[]) {
  const completed = timeline.filter(({ passed }) => passed).length;
  if (completed === 0) return 0;
  if (timeline.length <= 1) return 100;
  return Math.min(100, ((completed - 0.5) / (timeline.length - 1)) * 100);
}

export function getTrackingPayment(order: Order, mode: 'account' | 'guest') {
  const requiresUpfrontPayment = (order.items ?? []).some((item) => item.acceptPaymentOnDelivery === false);
  const paysByTransfer = order.payment?.paymentMethod?.toLowerCase().includes('transfer') ?? false;
  const mentionsBankCharges = order.payment?.paymentMethodDescription?.toLowerCase().includes('bank charge');
  const applyAccountCharge = mode === 'account' && (paysByTransfer || mentionsBankCharges);
  const transferCharge = requiresUpfrontPayment || applyAccountCharge ? getTransferCharge(order.totalPrice) : 0;

  return {
    requiresUpfrontPayment,
    paysByTransfer,
    transferCharge,
    totalWithCharge: order.totalPrice + transferCharge,
  };
}
