import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import {
  riderDeliveryApi,
  type RiderDelivery,
  type RiderDeliveryMetrics,
} from '../../../app/lib/riderDeliveryApi';

function num(metrics: RiderDeliveryMetrics, ...keys: string[]) {
  for (const key of keys) {
    const val = (metrics as Record<string, unknown>)[key];

    if (typeof val === 'number') {
      return val;
    }
  }

  return 0;
}

export default function DeliverySuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [metrics, setMetrics] = useState<RiderDeliveryMetrics>({});
  const [nextDeliveryId, setNextDeliveryId] = useState<string | null>(null);

  const [completedAt] = useState(() =>
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  useEffect(() => {
    if (!id) return;

    Promise.allSettled([
      riderDeliveryApi.getAssignedDelivery(id),
      riderDeliveryApi.getDeliveryOverview(),
      riderDeliveryApi.getAssignedDeliveries(),
    ]).then(([deliveryRes, metricsRes, deliveriesRes]) => {
      // Current delivery
      if (deliveryRes.status === 'fulfilled') {
        setDelivery(
          deliveryRes.value.data.data.delivery
        );
      }

      // Metrics
      if (metricsRes.status === 'fulfilled') {
        setMetrics(
          metricsRes.value.data.data
        );
      }

      // Find next assigned delivery
      if (deliveriesRes.status === 'fulfilled') {
        const deliveries =
          deliveriesRes.value.data.data.deliveries ?? [];

        const next = deliveries.find(
          (d) =>
            d.id !== id &&
            d.order?.orderStatus === 'ASSIGNED'
        );

        setNextDeliveryId(next?.id ?? null);
      }
    });
  }, [id]);

  const todaysTotal = num(
    metrics,
    'todaysEarnings',
    'todayEarnings'
  );

  const orderId = delivery?.id ?? id ?? '';

  const customerName =
    delivery?.order?.customerFullname ?? 'Customer';

  const deliveryAddress =
    delivery?.order?.deliveryAddress;

  const deliveryAmount =
    delivery?.order?.totalAmount ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F3F7EE] px-6 pt-16">
      {/* Success icon */}
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
        <CheckCircle2
          size={48}
          className="text-white"
          strokeWidth={2}
        />
      </span>

      <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
        Delivery Completed
      </h1>

      <p className="mt-1 text-center text-sm text-gray-500">
        Order #{orderId.slice(0, 8)} successfully dropped off.
      </p>

      {/* Customer information */}
      <div className="mt-6 w-full max-w-sm rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {customerName
              .slice(0, 1)
              .toUpperCase()}
          </span>

          <div>
            <p className="text-sm font-bold text-gray-900">
              {customerName}
            </p>

            {deliveryAddress && (
              <p className="text-xs text-gray-400">
                📍 {deliveryAddress}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">
              Completed Time
            </p>

            <p className="font-bold text-gray-900">
              {completedAt}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              Status
            </p>

            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              ✓ Verified
            </span>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="mt-4 w-full max-w-sm rounded-2xl border border-primary/10 bg-[#F3F7EE] p-4">
        <h3 className="text-sm font-bold text-gray-900">
          Earnings Update
        </h3>

        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">
            Delivery Fee Earned
          </span>

          <span className="font-semibold text-primary">
            ₦{Number(deliveryAmount).toLocaleString()}
          </span>
        </div>

        <div className="mt-1 flex justify-between text-base font-bold">
          <span className="text-gray-900">
            Today&apos;s Total
          </span>

          <span className="text-gray-900">
            ₦{todaysTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 w-full max-w-sm space-y-3 pb-10">
        {nextDeliveryId && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/rider/deliveries/${nextDeliveryId}`
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
          >
            View Next Delivery
            <ArrowRight size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate('/rider/home')}
          className="w-full rounded-full border border-primary py-3.5 text-sm font-semibold text-primary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
