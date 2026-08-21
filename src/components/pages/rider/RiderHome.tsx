import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Phone, Bike } from 'lucide-react';
import RiderLayout from './RiderLayout';
import { riderApi, extractRiderProfile } from '../../../app/lib/riderApi';
import {
  riderDeliveryApi,
  type RiderDelivery,
  type RiderDeliveryMetrics,
} from '../../../app/lib/riderDeliveryApi';

function num(metrics: RiderDeliveryMetrics, ...keys: string[]) {
  for (const key of keys) {
    const val = (metrics as Record<string, unknown>)[key];
    if (typeof val === 'number') return val;
  }
  return 0;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export default function RiderHome() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('Rider');
  const [metrics, setMetrics] = useState<RiderDeliveryMetrics>({});
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = () => {
    Promise.allSettled([
      riderApi.getProfile(),
      riderDeliveryApi.getDeliveryOverview(),
      riderDeliveryApi.getAssignedDeliveries(),
    ]).then(([profileRes, metricsRes, deliveriesRes]) => {
      if (profileRes.status === 'fulfilled') {
        const profile = extractRiderProfile(profileRes.value.data.data);
        setFirstName(profile.fullname?.split(' ')[0] ?? 'Rider');
      }
      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data.data);
      }
      if (deliveriesRes.status === 'fulfilled') {
        setDeliveries(deliveriesRes.value.data.data.deliveries ?? []);
      }
      setLoading(false);
    });
  };

  useEffect(fetchAll, []);

  const activeStatuses = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'];
  const current = deliveries.find((d) => activeStatuses.includes(d.status));
  const upNext = deliveries.find((d) => d.id !== current?.id && d.status === 'ASSIGNED');

  const todaysEarnings = num(metrics, 'todaysEarnings', 'todayEarnings');
  const totalDeliveries = num(metrics, 'totalDeliveries', 'deliveriesToday');
  const completed = num(metrics, 'completedToday', 'completed');
  const inProgress = num(metrics, 'activeDeliveries', 'inProgress');
  const remaining = num(metrics, 'pendingPickups', 'remaining');

  const handlePrimaryAction = async () => {
    if (!current) return;
    setActionBusy(true);
    setError('');
    try {
      if (current.status === 'ASSIGNED') {
        await riderDeliveryApi.pickUpOrder(current.id);
        fetchAll();
      } else if (current.status === 'PICKED_UP') {
        await riderDeliveryApi.startDelivery(current.id);
        fetchAll();
      } else if (current.status === 'IN_TRANSIT') {
        navigate(`/rider/deliveries/${current.id}/verify`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update delivery.');
    } finally {
      setActionBusy(false);
    }
  };

  const primaryActionLabel =
    current?.status === 'ASSIGNED'
      ? 'Pick Up Order'
      : current?.status === 'PICKED_UP'
      ? "I'm On My Way"
      : "I've Arrived";

  return (
    <RiderLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">Declan Rider</p>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `Good day, ${firstName}`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-bold text-gray-900">Status</p>
          <p className="text-xs text-gray-400">
            {online ? 'You are receiving orders' : 'You are offline'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOnline((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
            online ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-primary' : 'bg-gray-400'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">TODAY'S EARNINGS</p>
          <p className="text-xs text-gray-400">TOTAL DELIVERIES</p>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-2xl font-extrabold text-primary">₦{todaysEarnings.toLocaleString()}</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalDeliveries}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
          <div className="rounded-xl bg-primary/10 py-2">
            <p className="text-base font-bold text-primary">{completed}</p>
            <p className="text-[10px] text-gray-500">Completed</p>
          </div>
          <div className="rounded-xl bg-orange-50 py-2">
            <p className="text-base font-bold text-orange-500">{inProgress}</p>
            <p className="text-[10px] text-gray-500">In Progress</p>
          </div>
          <div className="rounded-xl bg-gray-100 py-2">
            <p className="text-base font-bold text-gray-700">{remaining}</p>
            <p className="text-[10px] text-gray-500">Remaining</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <p className="mt-6 text-xs font-semibold tracking-wide text-gray-400">CURRENT ORDER</p>

      {loading ? (
        <p className="mt-2 text-sm text-gray-400">Loading delivery...</p>
      ) : current ? (
        <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4">
            <div>
              <p className="font-bold text-gray-900">#{current.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">{current.customer?.name ?? 'Customer'}</p>
              {current.deliveryAddress && (
                <p className="text-xs text-gray-400">{current.deliveryAddress}</p>
              )}
            </div>
            <div className="text-right">
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                {statusLabel(current.status)}
              </span>
              <p className="mt-1 text-xs text-gray-400">Est. Payout</p>
              <p className="text-sm font-bold text-primary">
                ₦{Number(current.totalAmount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mx-4 mt-4 flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
            >
              <Navigation size={16} />
              Navigate
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
            >
              <Phone size={16} />
              Call Customer
            </button>
          </div>

          <div className="mx-4 mt-3">
            <button
              type="button"
              disabled={actionBusy}
              onClick={handlePrimaryAction}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Bike size={16} />
              {actionBusy ? 'Updating...' : primaryActionLabel}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/rider/deliveries/${current.id}`)}
            className="block w-full py-3 text-center text-sm font-semibold text-primary"
          >
            View Order Details
          </button>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-400">No active delivery right now.</p>
        </div>
      )}

      {upNext && (
        <>
          <p className="mt-6 text-xs font-semibold tracking-wide text-gray-400">UP NEXT</p>
          <button
            type="button"
            onClick={() => navigate(`/rider/deliveries/${upNext.id}`)}
            className="mt-2 flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-lg">
                🍽️
              </span>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">#{upNext.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-400">{upNext.deliveryAddress ?? 'Pickup'}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-primary">
              ₦{Number(upNext.totalAmount ?? 0).toLocaleString()}
            </p>
          </button>
        </>
      )}
    </RiderLayout>
  );
}