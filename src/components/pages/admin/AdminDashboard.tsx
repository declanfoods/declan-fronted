import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, TrendingUp, Clock, Plus } from 'lucide-react';
import AdminBottomNav from '../../admin/AdminBottomNav';
import AdminDrawer from '../../admin/AdminDrawer';
import Logo from '../../ui/Logo';

const lowStock = [
  { name: 'Fresh Yam Tubers', left: 5 },
  { name: 'Golden Penny Pasta', left: 8 },
  { name: 'Refined Palm Oil', left: 3 },
];

const topProducts = [
  { name: 'Long Grain Rice (50kg)', sold: 142, revenue: '₦1.2M' },
  { name: 'Vegetable Oil (5L)', sold: 96, revenue: '₦601K' },
];

const topPacks = [{ name: 'Student Essentials Bundle', sold: 215, revenue: '₦4.2M' }];

const activity = [
  { label: 'New customer registered', time: '2hr ago', tone: 'bg-primary' },
  { label: 'Referral payout approved', time: '15m ago', tone: 'bg-rose-500' },
  { label: 'Order #DF-899 delivered', time: '1hr ago', tone: 'bg-gray-400' },
];

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE]">
      <header className="flex items-center justify-between px-5 pt-6">
        <Logo className="h-10 w-auto" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-24 pt-6">
        <div className="rounded-2xl bg-primary p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={16} strokeWidth={2} />
            Revenue Insight
          </div>
          <p className="mt-1 text-sm text-white/90">
            Revenue increased by 18% compared to yesterday&apos;s mid-day average.
          </p>
        </div>

        <div className="rounded-2xl bg-gray-900 p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock size={16} strokeWidth={2} />
            Peak Hours
          </div>
          <p className="mt-1 text-sm text-white/80">
            Order volumes peak between 12 PM and 3 PM daily.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-sm text-gray-700">
                    {item.name} <span className="text-red-500">({item.left} left)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-[#F3F7EE]" />
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{item.sold} Sold</p>
                  <p className="text-xs text-gray-400">{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Top Food Packs</h2>
          <div className="space-y-3">
            {topPacks.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-[#F3F7EE]" />
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{item.sold} Sold</p>
                  <p className="text-xs text-gray-400">{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-gray-900">Recent Activity</h2>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${item.tone}`} />
                <p className="flex-1 text-sm text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={() => navigate('/admin/orders')}
        className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus size={16} strokeWidth={2.5} />
        Quick Create
      </button>

      <AdminBottomNav />

      {menuOpen && <AdminDrawer onClose={() => setMenuOpen(false)} />}
    </div>
  );
}
