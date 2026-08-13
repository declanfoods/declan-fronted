import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';

const dailyVolume = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 62 },
  { day: 'Wed', value: 95 },
  { day: 'Thu', value: 55 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 100 },
  { day: 'Sun', value: 58 },
];

const statusDistribution = [
  { label: 'Delivered', pct: 87, tone: 'text-primary' },
  { label: 'Pending', pct: 8, tone: 'text-rose-500' },
  { label: 'Cancelled', pct: 5, tone: 'text-red-600' },
];

const topProducts = [
  { name: 'Premium Basmati Rice (5kg)', sold: 184, trend: '+12% this week', up: true, revenue: '₦1,545,600' },
  { name: 'Refined Vegetable Oil (5L)', sold: 142, trend: '+8% this week', up: true, revenue: '₦923,000' },
  { name: 'Golden Penny Pasta (Pack)', sold: 96, trend: '-2% this week', up: false, revenue: '₦48,000' },
];

const topBundles = [
  { name: 'Family Breakfast Box', sold: 48 },
  { name: 'Fruit & Nut Combo', sold: 32 },
  { name: 'Essential Pantry Bundle', sold: 24 },
];

export default function OrderAnalytics() {
  const navigate = useNavigate();
  const maxVolume = Math.max(...dailyVolume.map((d) => d.value));

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
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm"
        >
          <Calendar size={14} />
          Today
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-24 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary p-4 text-white">
            <p className="text-xs font-medium text-white/80">Avg. Order Value</p>
            <p className="mt-1 text-2xl font-extrabold">₦8,400 ↗</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">Delivery Success</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">98% ✓</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">Total</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">142</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">Pending</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-500">12</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">Delivered</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">124</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">Cancelled</p>
            <p className="mt-1 text-2xl font-extrabold text-red-600">6</p>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Daily Order Volume</h2>
            <BarChart3 size={18} className="text-gray-300" />
          </div>
          <div className="flex h-32 items-end justify-between gap-2">
            {dailyVolume.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-md ${d.day === 'Wed' ? 'bg-primary' : 'bg-gray-200'}`}
                  style={{ height: `${(d.value / maxVolume) * 100}%` }}
                />
                <span
                  className={`text-xs font-semibold ${
                    d.day === 'Wed' ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Order Status Distribution</h2>
          <div className="flex items-center gap-6">
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#2D8E2D 0% 87%, #f43f5e 87% 95%, #dc2626 95% 100%)`,
              }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-900">
                142
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {statusDistribution.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.label === 'Delivered'
                          ? 'bg-primary'
                          : s.label === 'Pending'
                          ? 'bg-rose-500'
                          : 'bg-red-600'
                      }`}
                    />
                    {s.label}
                  </span>
                  <span className="font-bold text-gray-900">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Peak Hours</h2>
          <div className="relative h-24">
            <svg viewBox="0 0 300 100" className="h-full w-full" preserveAspectRatio="none">
              <path
                d="M0,80 C40,80 60,20 100,25 C140,30 160,70 190,70 C220,70 240,15 300,20"
                fill="none"
                stroke="#2D8E2D"
                strokeWidth="3"
              />
              <path
                d="M0,80 C40,80 60,20 100,25 C140,30 160,70 190,70 C220,70 240,15 300,20 L300,100 L0,100 Z"
                fill="#2D8E2D"
                opacity="0.08"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400">
            <span>08:00</span>
            <span className="font-bold text-gray-700">12:00</span>
            <span>16:00</span>
            <span>20:00</span>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Top Performing Products</h2>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{p.sold} sold</p>
                    <p className="text-xs text-gray-400">{p.revenue}</p>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      p.up ? 'text-primary' : 'text-red-500'
                    }`}
                  >
                    {p.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {p.trend}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (p.sold / 200) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Top Bundles Sold</h2>
          <div className="space-y-4">
            {topBundles.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-gray-800">{b.name}</p>
                  <p className="font-bold text-gray-900">{b.sold} sold</p>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (b.sold / 60) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AdminBottomNav />
    </div>
  );
}
