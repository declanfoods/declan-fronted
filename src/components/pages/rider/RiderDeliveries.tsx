import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiderLayout from './RiderLayout';
import { riderDeliveryApi, type RiderDelivery } from '../../../app/lib/riderDeliveryApi';

const stages = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
const stageLabels = ['Assigned', 'Picked Up', 'On the Way', 'Delivered'];

const filters = ['All', 'Pending', 'In Progress', 'Completed'];

function matchesFilter(status: string, filter: string) {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'ASSIGNED';
  if (filter === 'In Progress') return ['PICKED_UP', 'IN_TRANSIT', 'CODE_EXCHANGED'].includes(status);
  if (filter === 'Completed') return ['DELIVERED', 'COMPLETED'].includes(status);
  return true;
}

export default function RiderDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    riderDeliveryApi
      .getAssignedDeliveries()
      .then((res) => setDeliveries(res.data.data.deliveries ?? []))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load deliveries.'))
      .finally(() => setLoading(false));
  }, []);

  const total = deliveries.length;
  const completed = deliveries.filter((d) => ['DELIVERED', 'COMPLETED'].includes(d.status)).length;
  const inProgress = deliveries.filter((d) =>
    ['PICKED_UP', 'IN_TRANSIT', 'CODE_EXCHANGED'].includes(d.status)
  ).length;

  const filtered = deliveries.filter((d) => matchesFilter(d.status, activeFilter));

  return (
    <RiderLayout>
      <h2 className="text-xl font-bold text-gray-900">Today's Deliveries</h2>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-extrabold text-primary">{total}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-xl font-extrabold text-primary">{completed}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">In Progress</p>
          <p className="text-xl font-extrabold text-orange-500">{inProgress}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading && <p className="mt-6 text-center text-sm text-gray-400">Loading deliveries...</p>}

      {!loading && filtered.length === 0 && (
        <p className="mt-6 text-center text-sm text-gray-400">No deliveries here.</p>
      )}

      <div className="mt-4 space-y-3">
        {filtered.map((d) => {
          const isCurrent = ['PICKED_UP', 'IN_TRANSIT'].includes(d.status);
          const isCompleted = ['DELIVERED', 'COMPLETED'].includes(d.status);
          const stageIndex = stages.indexOf(d.status);

          return (
            <div
              key={d.id}
              className={`rounded-2xl bg-white p-4 shadow-sm ${
                isCurrent ? 'border-2 border-primary' : 'border border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                {isCurrent && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    Current Delivery
                  </span>
                )}
                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    isCompleted
                      ? 'bg-primary/10 text-primary'
                      : isCurrent
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {d.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="mt-2 font-bold text-gray-900">#{d.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-600">{d.customer?.name ?? 'Customer'}</p>
              <p className="text-xs text-gray-400">
                {d.items?.length ?? 0} items • ₦{Number(d.totalAmount ?? 0).toLocaleString()} total
              </p>

              {d.deliveryAddress && (
                <p className="mt-2 text-xs text-gray-500">📍 {d.deliveryAddress}</p>
              )}

              {isCurrent && stageIndex >= 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                  {stageLabels.map((label, idx) => (
                    <div key={label} className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          idx <= stageIndex ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          idx === stageIndex
                            ? 'font-semibold text-primary'
                            : idx < stageIndex
                            ? 'text-gray-500'
                            : 'text-gray-300'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate(`/rider/deliveries/${d.id}`)}
                className={`mt-3 w-full rounded-full py-2.5 text-sm font-semibold ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : 'border border-primary text-primary'
                }`}
              >
                {isCurrent ? 'Continue Delivery' : isCompleted ? 'View Details' : 'View Delivery'}
              </button>
            </div>
          );
        })}
      </div>
    </RiderLayout>
  );
}