import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Info,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { formatNaira } from '../../../data/products';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import { adminOrderApi } from '../../../../app/lib/adminOrderApi';
import type {
  AdminOrderMetrics,
  OrderMetricsPeriod,
} from '../../../../app/lib/adminOrderApi';
import { queryKeys } from '../../../../app/lib/query-client';

/*
|==========================================================================
| ADMIN → ORDER INSIGHTS   (analytics/OrderAnalytics.tsx)
|==========================================================================
|
| THIS ENTIRE SCREEN USED TO BE FAKE.
|
| Every number below was a literal in this file: the daily-volume bar chart
| was seven invented days, the status donut was a hardcoded conic-gradient
| with 87/8/5 split, "Avg. Order Value ₦8,400" and "Delivery Success 98%"
| were strings, peak hours was a hand-drawn SVG path, and the product and
| bundle leaderboards were three made-up rows each. It presented as a working
| analytics screen while showing nothing at all.
|
| It now runs on GET /api/v1/admin/orders/metrics, which returns:
|
|   period, avgOrderValue, deliverySuccessRate
|   counts { total, delivered, pending, cancelled }
|   statusDistribution[] { status, count, percentage }
|   dailyVolume[]        { day, count }
|   peakHours[]          { hour, label, count }        (always 24 entries)
|   topProducts[]        { itemId, name, totalSold, totalRevenue, weeklyGrowthPct }
|   topFoodPacks[]       { same shape as topProducts }
|
| ── THE PERIOD SELECTOR IS REAL ──────────────────────────────────────────
| ?period= accepts today | week | month. The old "Today" chip was decoration;
| it is now a working three-way switch, and each period is cached separately
| so flipping back is instant.
|
| ── TWO PAYLOAD QUIRKS HANDLED HERE ──────────────────────────────────────
| 1. `dailyVolume` REPEATS DAYS. The month response contains "Mon" twice
|    (3 and 1) and the week response is just Mon, Tue — it is not a padded
|    seven-slot week. Drawn raw that gives duplicate React keys and two bars
|    both labelled Mon, so `volumeByDay` sums by day name first and orders by
|    weekday.
|
| 2. `weeklyGrowthPct` IS NULL WHEN UNKNOWN. Not zero growth — no prior week
|    to compare. So the trend chip is omitted rather than printing "null%".
|
| Also: `deliverySuccessRate` and the status percentages are 0-100 numbers,
| not 0-1 fractions, and `avgOrderValue` / `totalRevenue` are plain numbers
| rather than the money strings used elsewhere in this API.
*/

const PERIODS: { key: OrderMetricsPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
];

/** Monday-first order, so the bar chart reads like a week. */
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Fallback palette for status slices the designer did not anticipate. */
const STATUS_TONES = [
  'bg-primary',
  'bg-rose-500',
  'bg-red-600',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
];

function statusTone(status: string, index: number): string {
  const s = status.toUpperCase();

  if (s === 'DELIVERED') return 'bg-primary';
  if (s === 'PENDING' || s === 'PROCESSING') return 'bg-rose-500';
  if (s === 'CANCELLED') return 'bg-red-600';

  return STATUS_TONES[index % STATUS_TONES.length];
}

/** 'DELIVERED' → 'Delivered'. The API sends uppercase enum values. */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function OrderAnalytics() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<OrderMetricsPeriod>('week');

  const metricsQuery = useQuery<AdminOrderMetrics, Error>({
    queryKey: queryKeys.adminOrderMetrics(period),
    queryFn: async () => {
      const res = await adminOrderApi.getMetrics(period);
      return res.data.data.metrics;
    },
    // Keep the previous period's figures on screen while the new ones load,
    // so switching does not blank the page.
    placeholderData: (previous) => previous,
  });

  const metrics = metricsQuery.data;

  /*
    Sum `dailyVolume` by day name. The payload is not guaranteed to be one row
    per day — the month sample genuinely repeats "Mon" — and this also folds
    an out-of-order or partial week into a stable Mon→Sun sequence.
  */
  const volumeByDay = useMemo(() => {
    const totals = new Map<string, number>();

    for (const entry of metrics?.dailyVolume ?? []) {
      totals.set(entry.day, (totals.get(entry.day) ?? 0) + Number(entry.count ?? 0));
    }

    /*
      Days the payload did not mention are kept at 0 rather than dropped: a
      quiet Tuesday that returns no row is a real zero on the chart, and
      silently omitting it would misrepresent the shape of the week.
      Any day name the API invents beyond the seven is appended at the end
      rather than thrown away.
    */
    const known = DAY_ORDER.map((day) => ({ day, count: totals.get(day) ?? 0 }));
    const extras = [...totals.keys()]
      .filter((day) => !DAY_ORDER.includes(day))
      .map((day) => ({ day, count: totals.get(day) ?? 0 }));

    return [...known, ...extras];
  }, [metrics?.dailyVolume]);

  const maxVolume = Math.max(1, ...volumeByDay.map((d) => d.count));

  /*
    The busiest hour, for the "Peak Hours" summary. `peakHours` always carries
    all 24 slots including zeros, so this is a max over real data rather than
    an assumption that hour 12 is busy.
  */
  const busiestHour = useMemo(() => {
    const hours = metrics?.peakHours ?? [];
    if (hours.length === 0) return null;

    return hours.reduce((best, h) =>
      Number(h.count ?? 0) > Number(best.count ?? 0) ? h : best
    );
  }, [metrics?.peakHours]);

  const maxHourCount = Math.max(
    1,
    ...(metrics?.peakHours ?? []).map((h) => Number(h.count ?? 0))
  );

  const topProducts = metrics?.topProducts ?? [];
  const topFoodPacks = metrics?.topFoodPacks ?? [];

  // Bars scale against the leader on each list, not an invented denominator.
  const maxSold = Math.max(1, ...topProducts.map((p) => Number(p.totalSold ?? 0)));
  const maxPackSold = Math.max(1, ...topFoodPacks.map((p) => Number(p.totalSold ?? 0)));

  /*
    The donut. Built from the real percentages so the ring always closes at
    100% regardless of how many statuses come back.
  */
  const donutGradient = useMemo(() => {
    const slices = metrics?.statusDistribution ?? [];
    if (slices.length === 0) return null;

    let cursor = 0;
    const stops = slices.map((slice, index) => {
      const from = cursor;
      const to = Math.min(100, cursor + Number(slice.percentage ?? 0));
      cursor = to;

      const colour =
        slice.status.toUpperCase() === 'DELIVERED'
          ? '#2D8E2D'
          : slice.status.toUpperCase() === 'PENDING' ||
              slice.status.toUpperCase() === 'PROCESSING'
            ? '#f43f5e'
            : slice.status.toUpperCase() === 'CANCELLED'
              ? '#dc2626'
              : ['#2D8E2D', '#f43f5e', '#dc2626', '#f59e0b', '#0ea5e9', '#8b5cf6'][
                  index % 6
                ];

      return `${colour} ${from}% ${to}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }, [metrics?.statusDistribution]);

  const counts = metrics?.counts;

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Order Insights</h1>
        <button
          type="button"
          onClick={() => metricsQuery.refetch()}
          disabled={metricsQuery.isFetching}
          aria-label="Refresh"
          className="text-primary-dark disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={metricsQuery.isFetching ? 'animate-spin' : ''}
          />
        </button>
      </header>

      {/* ─── Period selector — this actually refetches ─── */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="shrink-0 text-gray-400" />
          <div className="flex flex-1 rounded-full bg-white p-1 shadow-sm">
            {PERIODS.map(({ key, label }) => {
              const active = period === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  aria-pressed={active}
                  className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                    active ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pb-24 pt-5">
        {/* ─── Loading ─── */}
        {metricsQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading order insights…</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {metricsQuery.isError && !metricsQuery.isLoading && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                metricsQuery.error,
                'Could not load order insights.'
              )}
            </p>
            <button
              type="button"
              onClick={() => metricsQuery.refetch()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {metrics && !metricsQuery.isError && (
          <>
            {/* ─── Headline figures ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-primary p-4 text-white">
                <p className="text-xs font-medium text-white/80">
                  Avg. Order Value
                </p>
                <p className="mt-1 text-2xl font-extrabold">
                  {formatNaira(Number(metrics.avgOrderValue ?? 0))}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400">
                  Delivery Success
                </p>
                <p className="mt-1 text-2xl font-extrabold text-primary">
                  {Number(metrics.deliverySuccessRate ?? 0)}%
                </p>
              </div>
            </div>

            {/* ─── Counts ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">
                  {Number(counts?.total ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400">Pending</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-500">
                  {Number(counts?.pending ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400">Delivered</p>
                <p className="mt-1 text-2xl font-extrabold text-primary">
                  {Number(counts?.delivered ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-400">Cancelled</p>
                <p className="mt-1 text-2xl font-extrabold text-red-600">
                  {Number(counts?.cancelled ?? 0)}
                </p>
              </div>
            </div>

            {/* ─── Daily volume ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Order Volume
                </h2>
                <BarChart3 size={18} className="text-gray-300" />
              </div>

              {volumeByDay.every((d) => d.count === 0) ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  No orders in this period.
                </p>
              ) : (
                <>
                  <div className="flex h-32 items-end justify-between gap-2">
                    {volumeByDay.map((d) => {
                      const isPeak = d.count === maxVolume && d.count > 0;

                      return (
                        <div
                          key={d.day}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          {/* Height is proportional to the busiest day. */}
                          <span className="text-[10px] font-semibold text-gray-500">
                            {d.count > 0 ? d.count : ''}
                          </span>
                          <div
                            className={`w-full rounded-md ${
                              isPeak ? 'bg-primary' : 'bg-gray-200'
                            }`}
                            style={{
                              height: `${Math.max(2, (d.count / maxVolume) * 100)}%`,
                            }}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              isPeak ? 'text-primary' : 'text-gray-400'
                            }`}
                          >
                            {d.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/*
                    Daily volume is not the same shape every period: `today`
                    returns no rows, `week` returns only the days that had
                    orders, `month` can repeat a day. Saying so avoids the
                    chart being read as a full week.
                  */}
                  {metrics.dailyVolume.length < 7 && (
                    <p className="mt-3 text-[10px] text-gray-400">
                      Shows only the days that had orders in this period.
                    </p>
                  )}
                </>
              )}
            </section>

            {/* ─── Status distribution ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">
                Order Status Distribution
              </h2>

              {metrics.statusDistribution.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  No orders in this period.
                </p>
              ) : (
                <div className="flex items-center gap-6">
                  <div
                    className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                    style={
                      donutGradient
                        ? { background: donutGradient }
                        : { background: '#e5e7eb' }
                    }
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-lg font-bold text-gray-900">
                        {Number(counts?.total ?? 0)}
                      </span>
                      <span className="text-[10px] text-gray-400">orders</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {metrics.statusDistribution.map((s, i) => (
                      <div
                        key={s.status}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-gray-600">
                          <span
                            className={`h-2 w-2 rounded-full ${statusTone(
                              s.status,
                              i
                            )}`}
                          />
                          {titleCase(s.status)}
                        </span>
                        <span className="font-bold text-gray-900">
                          {Number(s.percentage ?? 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ─── Peak hours ─── */}
            {busiestHour && (
              <section className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">
                    Peak Hours
                  </h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Busiest {busiestHour.label}
                  </span>
                </div>
                <p className="mb-4 text-xs text-gray-400">
                  When orders come in, hour by hour.
                </p>

                {/*
                  Replaces a hand-drawn SVG curve. This is the real 24-hour
                  distribution as bars — no interpolation, so a quiet hour
                  looks quiet.
                */}
                <div className="flex h-24 items-end gap-[3px]">
                  {metrics.peakHours.map((h) => (
                    <div
                      key={h.hour}
                      className="flex flex-1 flex-col justify-end"
                      style={{ height: '100%' }}
                      title={`${h.label} — ${h.count} order${
                        h.count === 1 ? '' : 's'
                      }`}
                    >
                      <div
                        className={`w-full rounded-sm ${
                          h.count === 0 ? 'bg-gray-100' : 'bg-primary'
                        }`}
                        style={{
                          height: `${Math.max(3, (Number(h.count ?? 0) / maxHourCount) * 100)}%`,
                          opacity: h.count === 0 ? 1 : 0.35 + 0.65 * (Number(h.count ?? 0) / maxHourCount),
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-between text-xs font-medium text-gray-400">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
              </section>
            )}

            {/* ─── Top products ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">
                Top Performing Products
              </h2>

              {topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  Nothing sold in this period.
                </p>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((p) => (
                    <div key={p.itemId}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">
                          {p.name}
                        </p>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {Number(p.totalSold ?? 0)} sold
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNaira(Number(p.totalRevenue ?? 0))}
                          </p>
                        </div>
                      </div>

                      {/*
                        weeklyGrowthPct is null when there is no prior week to
                        compare against — that is "unknown", not "flat", so
                        nothing is drawn instead of a misleading 0%.
                      */}
                      {p.weeklyGrowthPct !== null &&
                        p.weeklyGrowthPct !== undefined && (
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                Number(p.weeklyGrowthPct) >= 0
                                  ? 'text-primary'
                                  : 'text-red-500'
                              }`}
                            >
                              {Number(p.weeklyGrowthPct) >= 0 ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )}
                              {Number(p.weeklyGrowthPct) >= 0 ? '+' : ''}
                              {Number(p.weeklyGrowthPct)}% this week
                            </span>
                          </div>
                        )}

                      {/* Scaled against the top seller, not a fixed 200. */}
                      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(p.totalSold ?? 0) / maxSold) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ─── Top food packs ─── */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">
                Top Bundles Sold
              </h2>

              {topFoodPacks.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  No food packs sold in this period.
                </p>
              ) : (
                <div className="space-y-4">
                  {topFoodPacks.map((b) => (
                    <div key={b.itemId}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <p className="min-w-0 flex-1 truncate font-semibold text-gray-800">
                          {b.name}
                        </p>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-gray-900">
                            {Number(b.totalSold ?? 0)} sold
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNaira(Number(b.totalRevenue ?? 0))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(b.totalSold ?? 0) / maxPackSold) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ─── Period caveat ─── */}
            <div className="flex gap-2 rounded-2xl bg-white/60 p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-[11px] text-gray-500">
                Showing {PERIODS.find((p) => p.key === metrics.period)?.label ??
                  metrics.period}
                . Every figure on this page comes from the order metrics
                endpoint — nothing here is estimated.
              </p>
            </div>
          </>
        )}
      </main>

      <AdminBottomNav />
    </div>
  );
}