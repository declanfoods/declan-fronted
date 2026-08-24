import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Phone, Bike } from 'lucide-react';
import RiderLayout from './RiderLayout';
import {
  riderApi,
  extractRiderProfile,
} from '../../../app/lib/riderApi';
import {
  riderDeliveryApi,
  type RiderDelivery,
  type RiderDeliveryMetrics,
} from '../../../app/lib/riderDeliveryApi';

function num(
  metrics: RiderDeliveryMetrics,
  ...keys: string[]
) {
  for (const key of keys) {
    const val = (metrics as Record<string, unknown>)[key];

    if (typeof val === 'number') {
      return val;
    }

    if (typeof val === 'string' && val.trim() !== '') {
      const parsed = Number(val);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function getStatus(delivery?: RiderDelivery) {
  return delivery?.order?.orderStatus ?? 'ASSIGNED';
}

function statusLabel(status?: string) {
  return (status ?? 'UNKNOWN').replace(/_/g, ' ');
}

export default function RiderHome() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('Rider');
  const [metrics, setMetrics] =
    useState<RiderDeliveryMetrics>({});
  const [deliveries, setDeliveries] = useState<
    RiderDelivery[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        riderApi.getProfile(),
        riderDeliveryApi.getDeliveryOverview(),
        riderDeliveryApi.getAssignedDeliveries(),
      ]);

      const [profileRes, metricsRes, deliveriesRes] =
        results;

      if (profileRes.status === 'fulfilled') {
        console.log(
          'RIDER PROFILE API RESPONSE:',
          profileRes.value.data
        );

        const profile = extractRiderProfile(
          profileRes.value.data.data
        );

        const name =
          profile?.fullname?.trim() || 'Rider';

        setFirstName(
          name.split(' ')[0] || 'Rider'
        );
      }

      if (metricsRes.status === 'fulfilled') {
        console.log(
          'RIDER METRICS API RESPONSE:',
          metricsRes.value.data
        );

        setMetrics(
          metricsRes.value.data.data ?? {}
        );
      }

      if (deliveriesRes.status === 'fulfilled') {
        console.log(
          'DELIVERIES API RESPONSE:',
          deliveriesRes.value.data
        );

        setDeliveries(
          deliveriesRes.value.data.data
            ?.deliveries ?? []
        );
      }
    } catch (err: any) {
      console.error(
        'RIDER HOME ERROR:',
        err
      );

      setError(
        err.response?.data?.message ??
          'Failed to load rider information.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const activeStatuses = [
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED',
  ];

  const current = deliveries.find((delivery) =>
    activeStatuses.includes(
      getStatus(delivery)
    )
  );

  const upNext = deliveries.find(
    (delivery) =>
      delivery.id !== current?.id &&
      getStatus(delivery) === 'ASSIGNED'
  );

  const todaysEarnings = num(
    metrics,
    'todaysEarnings',
    'todayEarnings',
    'earningsToday'
  );

  const totalDeliveries = num(
    metrics,
    'totalDeliveries',
    'deliveriesToday',
    'todaysDeliveries'
  );

  const completed = num(
    metrics,
    'completedToday',
    'completed',
    'completedDeliveries'
  );

  const inProgress = num(
    metrics,
    'activeDeliveries',
    'inProgress',
    'inProgressDeliveries'
  );

  const remaining = num(
    metrics,
    'pendingPickups',
    'remaining',
    'pendingDeliveries'
  );

  const handlePrimaryAction = async () => {
    if (!current) return;

    const status = getStatus(current);

    setActionBusy(true);
    setError('');

    try {
      if (status === 'ASSIGNED') {
        await riderDeliveryApi.pickUpOrder(
          current.id
        );

        await fetchAll();
      } else if (status === 'PICKED_UP') {
        await riderDeliveryApi.startDelivery(
          current.id
        );

        await fetchAll();
      } else if (
        status === 'IN_TRANSIT' ||
        status === 'ARRIVED'
      ) {
        navigate(
          `/rider/deliveries/${current.id}/verify`
        );
      }
    } catch (err: any) {
      console.error(
        'DELIVERY ACTION ERROR:',
        err
      );

      setError(
        err.response?.data?.message ??
          'Failed to update delivery.'
      );
    } finally {
      setActionBusy(false);
    }
  };

  const currentStatus = getStatus(current);

  const primaryActionLabel =
    currentStatus === 'ASSIGNED'
      ? 'Pick Up Order'
      : currentStatus === 'PICKED_UP'
      ? "I'm On My Way"
      : currentStatus === 'IN_TRANSIT' ||
        currentStatus === 'ARRIVED'
      ? "I've Arrived"
      : null;

  return (
    <RiderLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">
            Declan Rider
          </p>

          <p className="text-sm text-gray-500">
            {loading
              ? 'Loading...'
              : `Good day, ${firstName}`}
          </p>
        </div>
      </div>

      {/* Online Status */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Status
          </p>

          <p className="text-xs text-gray-400">
            {online
              ? 'You are receiving orders'
              : 'You are offline'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setOnline((value) => !value)
          }
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
            online
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              online
                ? 'bg-primary'
                : 'bg-gray-400'
            }`}
          />

          {online ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      {/* Earnings / Deliveries */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            TODAY'S EARNINGS
          </p>

          <p className="text-xs text-gray-400">
            TOTAL DELIVERIES
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-2xl font-extrabold text-primary">
            ₦{todaysEarnings.toLocaleString()}
          </p>

          <p className="text-2xl font-extrabold text-gray-900">
            {totalDeliveries}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
          <div className="rounded-xl bg-primary/10 py-2">
            <p className="text-base font-bold text-primary">
              {completed}
            </p>

            <p className="text-[10px] text-gray-500">
              Completed
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 py-2">
            <p className="text-base font-bold text-orange-500">
              {inProgress}
            </p>

            <p className="text-[10px] text-gray-500">
              In Progress
            </p>
          </div>

          <div className="rounded-xl bg-gray-100 py-2">
            <p className="text-base font-bold text-gray-700">
              {remaining}
            </p>

            <p className="text-[10px] text-gray-500">
              Remaining
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Current Order */}
      <p className="mt-6 text-xs font-semibold tracking-wide text-gray-400">
        CURRENT ORDER
      </p>

      {loading ? (
        <p className="mt-2 text-sm text-gray-400">
          Loading delivery...
        </p>
      ) : current ? (
        <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Order Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <div>
              <p className="font-bold text-gray-900">
                #
                {current.order?.orderNumber ??
                  current.id.slice(0, 8)}
              </p>

              <p className="text-xs text-gray-500">
                {current.order
                  ?.customerFullname ??
                  'Customer'}
              </p>

              {current.order
                ?.deliveryAddress && (
                <p className="text-xs text-gray-400">
                  {
                    current.order
                      .deliveryAddress
                  }
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                {statusLabel(currentStatus)}
              </span>

              <p className="mt-1 text-xs text-gray-400">
                Order Value
              </p>

              <p className="text-sm font-bold text-primary">
                ₦
                {Number(
                  current.order?.subTotal ??
                    0
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order Info */}
          <div className="mx-4 mt-4 rounded-xl bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400">
                  ITEMS
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  {current.order?.items
                    ?.length ?? 0}{' '}
                  items
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">
                  QUANTITY
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  {current.order
                    ?.totalQuantityOfItems ??
                    0}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation / Call */}
          <div className="mx-4 mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const address =
                  current.order
                    ?.deliveryAddress;

                if (address) {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      address
                    )}`,
                    '_blank'
                  );
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
            >
              <Navigation size={16} />
              Navigate
            </button>

            <button
              type="button"
              onClick={() => {
                const phone =
                  current.order
                    ?.customerPhoneNumber;

                if (phone) {
                  window.location.href = `tel:${phone}`;
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
            >
              <Phone size={16} />
              Call Customer
            </button>
          </div>

          {/* Primary Action */}
          {primaryActionLabel && (
            <div className="mx-4 mt-3">
              <button
                type="button"
                disabled={actionBusy}
                onClick={
                  handlePrimaryAction
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Bike size={16} />

                {actionBusy
                  ? 'Updating...'
                  : primaryActionLabel}
              </button>
            </div>
          )}

          {/* View Details */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/rider/deliveries/${current.id}`
              )
            }
            className="block w-full py-3 text-center text-sm font-semibold text-primary"
          >
            View Order Details
          </button>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            No active delivery right now.
          </p>
        </div>
      )}

      {/* Up Next */}
      {upNext && (
        <>
          <p className="mt-6 text-xs font-semibold tracking-wide text-gray-400">
            UP NEXT
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/rider/deliveries/${upNext.id}`
              )
            }
            className="mt-2 flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-lg">
                🍽️
              </span>

              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">
                  #
                  {upNext.order
                    ?.orderNumber ??
                    upNext.id.slice(0, 8)}
                </p>

                <p className="text-xs text-gray-400">
                  {upNext.order
                    ?.deliveryAddress ??
                    'Pickup'}
                </p>
              </div>
            </div>

            <p className="text-sm font-bold text-primary">
              ₦
              {Number(
                upNext.order?.subTotal ?? 0
              ).toLocaleString()}
            </p>
          </button>
        </>
      )}
    </RiderLayout>
  );
}