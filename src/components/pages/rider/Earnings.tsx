import { useEffect, useState } from 'react';
import { BarChart3, Landmark } from 'lucide-react';
import RiderLayout from './RiderLayout';
import {
  riderDeliveryApi,
  type RiderDelivery,
  type RiderDeliveryMetrics,
} from '../../../app/lib/riderDeliveryApi';

type Period = 'Today' | 'This Week' | 'This Month';
const periods: Period[] = ['Today', 'This Week', 'This Month'];

function num(metrics: RiderDeliveryMetrics, ...keys: string[]) {
  for (const key of keys) {
    const val = (metrics as Record<string, unknown>)[key];
    if (typeof val === 'number') return val;
  }
  return 0;
}

export default function Earnings() {
  const [period, setPeriod] = useState<Period>('Today');
  const [metrics, setMetrics] = useState<RiderDeliveryMetrics>({});
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      riderDeliveryApi.getDeliveryOverview(),
      riderDeliveryApi.getAssignedDeliveries(),
    ])
      .then(([metricsRes, deliveriesRes]) => {
        if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data.data);
        else setError('Failed to load earnings.');
        if (deliveriesRes.status === 'fulfilled') {
          setDeliveries(deliveriesRes.value.data.data.deliveries ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const todaysEarnings = num(metrics, 'todaysEarnings', 'todayEarnings');
  const weekEarnings = num(metrics, 'weeklyEarnings', 'thisWeekEarnings');
  const pendingPayout = num(metrics, 'pendingPayout');
  const lastPayoutAmount = num(metrics, 'lastPayoutAmount');

  const completedDeliveries = deliveries
    .filter((d) => ['DELIVERED', 'COMPLETED'].includes(d.status))
    .slice(0, 5);

  return (
    <RiderLayout>
      <h2 className="text-xl font-bold text-gray-900">Earnings</h2>

      <div className="mt-4 flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              period === p ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-center text-sm text-gray-400">Loading earnings...</p>
      ) : (
        <>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-400">
              {period === 'Today' ? "Today's Earnings" : `${period} Earnings`}
            </p>
            <p className="mt-1 text-3xl font-extrabold text-primary">
              ₦{(period === 'Today' ? todaysEarnings : weekEarnings).toLocaleString()}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">This Week</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                ₦{weekEarnings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">Pending Payout</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                ₦{pendingPayout.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Weekly Trend</h3>
              <BarChart3 size={18} className="text-gray-300" />
            </div>
            <p className="py-6 text-center text-xs text-gray-400">
              A per-day earnings breakdown isn&apos;t in the metrics response yet — once that
              field exists, the trend chart plugs in here.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
              <Landmark size={16} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Last Payout</p>
              <p className="text-xs text-gray-400">Bank Transfer</p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              ₦{lastPayoutAmount.toLocaleString()}
            </p>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Recent Deliveries</h3>
            </div>
            <div className="space-y-2">
              {completedDeliveries.length === 0 && (
                <p className="text-sm text-gray-400">No completed deliveries yet.</p>
              )}
              {completedDeliveries.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">#{d.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    ₦{Number(d.totalAmount ?? 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </RiderLayout>
  );
}