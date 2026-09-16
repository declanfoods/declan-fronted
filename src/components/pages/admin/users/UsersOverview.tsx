import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, UserPlus, BarChart3 } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import StatusPill from '../../../admin/StatusPill';
import { mockUsers } from './mockUsers';

const filters = ['All', 'Active', 'Inactive', 'Suspended'];

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function UsersOverview() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = mockUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.custId.toLowerCase().includes(q);
    const matchesFilter = activeFilter === 'All' || u.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCustomers = mockUsers.length;
  const newThisMonth = 842;

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Users</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/users/analytics')}
          aria-label="User analytics"
          className="text-primary-dark"
        >
          <BarChart3 size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for users by name, email or ID..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
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

      <div className="mt-4 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
        <div className="min-w-[140px] rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400">TOTAL CUSTOMERS</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-extrabold text-gray-900">
              {totalCustomers.toLocaleString()}
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              +4%
            </span>
          </div>
        </div>
        <div className="min-w-[140px] rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400">NEW (MONTH)</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-extrabold text-gray-900">{newThisMonth}</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              +12%
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No users found.</p>
        )}

        {filtered.map((user) => (
          <div key={user.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    {user.verified && <span className="text-primary">✓</span>}
                  </div>
                  <p className="text-xs text-gray-400">{user.custId}</p>
                </div>
              </div>
              <button type="button" aria-label="More actions" className="text-gray-400">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">EMAIL ADDRESS</p>
                <p className="truncate text-gray-700">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">WALLET BALANCE</p>
                <p
                  className={`font-semibold ${
                    user.walletBalance > 0 ? 'text-primary' : 'text-red-500 line-through'
                  }`}
                >
                  {formatNaira(user.walletBalance)}
                </p>
              </div>
              {user.status !== 'Suspended' && (
                <>
                  <div>
                    <p className="text-xs text-gray-400">LIFETIME SPEND</p>
                    <p className="font-semibold text-gray-800">
                      {formatNaira(user.lifetimeSpend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">TOTAL ORDERS</p>
                    <p className="font-semibold text-gray-800">{user.totalOrders}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill label={user.status} dot />
              {user.status !== 'Suspended' && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  Referral: {user.referralActive ? 'Active' : 'Inactive'}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                Last: {user.lastSeen}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/admin/users/${user.id}`)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#F3F7EE] py-2.5 text-sm font-semibold text-primary-dark"
            >
              View Full Details
              <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </main>

      <button
        type="button"
        aria-label="Add user"
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
      >
        <UserPlus size={22} strokeWidth={2.5} />
      </button>

      <AdminBottomNav />
    </div>
  );
}