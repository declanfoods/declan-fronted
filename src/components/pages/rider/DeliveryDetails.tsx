import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, MessageSquare, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import RiderTopBar from './RiderTopBar';
import { riderDeliveryApi, type RiderDelivery } from '../../../app/lib/riderDeliveryApi';

const stages = [
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'On the Way' },
  { key: 'ARRIVED', label: 'Arrived' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function formatAmount(amount: unknown) {
  const num = Number(amount);
  return Number.isNaN(num) ? '—' : `₦${num.toLocaleString()}`;
}

export default function DeliveryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const fetchDelivery = () => {
    if (!id) return;
    setLoading(true);
    riderDeliveryApi
      .getAssignedDelivery(id)
      .then((res) => setDelivery(res.data.data.delivery))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load delivery.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDelivery, [id]);

  const currentIndex = stages.findIndex((s) => s.key === delivery?.status);

  const handleAction = async () => {
    if (!id || !delivery) return;
    setActionBusy(true);
    setError('');
    try {
      if (delivery.status === 'ASSIGNED') {
        await riderDeliveryApi.pickUpOrder(id);
        fetchDelivery();
      } else if (delivery.status === 'PICKED_UP') {
        await riderDeliveryApi.startDelivery(id);
        fetchDelivery();
      } else if (delivery.status === 'IN_TRANSIT') {
        navigate(`/rider/deliveries/${id}/verify`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update delivery.');
    } finally {
      setActionBusy(false);
    }
  };

  const actionLabel =
    delivery?.status === 'ASSIGNED'
      ? 'Pick Up Order'
      : delivery?.status === 'PICKED_UP'
      ? 'Start Delivery'
      : delivery?.status === 'IN_TRANSIT'
      ? "I've Arrived"
      : null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
        <RiderTopBar title="Delivery Details" />
        <p className="py-10 text-center text-sm text-gray-400">Loading delivery...</p>
      </div>
    );
  }

  if (error && !delivery) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
        <RiderTopBar title="Delivery Details" />
        <p className="py-10 text-center text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!delivery) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      <RiderTopBar title="Delivery Details" />

      <main className="flex-1 space-y-4 px-4 pt-4 sm:px-6">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">#{delivery.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">
                Delivery is currently {delivery.status.replace(/_/g, ' ').toLowerCase()}.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">
              {delivery.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Delivery Progress</h3>
          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const done = currentIndex >= 0 && idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      done
                        ? 'bg-primary text-white'
                        : isCurrent
                        ? 'border-2 border-primary bg-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {done ? '✓' : isCurrent ? <span className="h-2 w-2 rounded-full bg-primary" /> : ''}
                  </span>
                  <span
                    className={`text-sm ${
                      done || isCurrent ? 'font-semibold text-primary' : 'text-gray-300'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F7EE] text-sm font-bold text-primary">
              {(delivery.customer?.name ?? 'C').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="font-bold text-gray-900">{delivery.customer?.name ?? 'Customer'}</p>
              {delivery.deliveryAddress && (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  {delivery.deliveryAddress}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary py-2.5 text-sm font-semibold text-primary"
            >
              <Phone size={16} />
              Call
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary py-2.5 text-sm font-semibold text-primary"
            >
              <MessageSquare size={16} />
              Message
            </button>
          </div>
        </div>

        {delivery.deliveryInstructions && (
          <div className="flex gap-2 rounded-2xl bg-orange-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-bold text-orange-700">Delivery Instructions</p>
              <p className="mt-0.5 text-sm text-orange-700/80">{delivery.deliveryInstructions}</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="space-y-2 border-l-2 border-dashed border-gray-200 pl-4">
            <div className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gray-400" />
              <p className="text-xs text-gray-400">Pickup</p>
              <p className="text-sm font-semibold text-gray-800">Declan Foods Warehouse</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-xs text-gray-400">Destination</p>
              <p className="text-sm font-semibold text-gray-800">
                {delivery.deliveryAddress ?? 'Customer address'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-primary py-2.5 text-sm font-semibold text-primary"
          >
            <Navigation size={16} />
            Navigate
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Order Contents</h3>
          <div className="divide-y divide-gray-100">
            {(delivery.items ?? []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">
                  {item.name ?? 'Item'} × {item.quantity ?? 1}
                </span>
                <span className="font-semibold text-gray-900">{formatAmount(item.price)}</span>
              </div>
            ))}
            {(!delivery.items || delivery.items.length === 0) && (
              <p className="py-2 text-sm text-gray-400">No item details available.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Order Summary</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              Paid
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
            <span className="text-gray-900">Total Order Value</span>
            <span className="text-primary">{formatAmount(delivery.totalAmount)}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 space-y-2 border-t border-gray-100 bg-white p-4">
        {actionLabel && (
          <button
            type="button"
            disabled={actionBusy}
            onClick={handleAction}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {actionBusy ? 'Updating...' : actionLabel}
          </button>
        )}
        <button type="button" className="w-full text-center text-sm font-semibold text-red-500">
          Report a Delivery Issue
        </button>
      </div>
    </div>
  );
}