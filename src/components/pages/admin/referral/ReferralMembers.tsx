import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, DollarSign, SlidersHorizontal, MoreVertical } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { mockMembers } from './mockReferralData';

const levels = ['All Levels', 'L1', 'L2', 'L3', 'L4'];

export default function ReferralMembers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('All Levels');

  const filtered = mockMembers.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
    const matchesLevel = activeLevel === 'All Levels' || m.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members or codes..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {levels.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLevel(l)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeLevel === l ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary p-4 text-white">
            <Users size={18} className="mb-2 text-white/80" />
            <p className="text-xl font-extrabold">1,284</p>
            <p className="text-xs text-white/80">Total Network</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <DollarSign size={18} className="mb-2 text-rose-500" />
            <p className="text-xl font-extrabold text-gray-900">₦4.2M</p>
            <p className="text-xs text-gray-400">Total Paid</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Member Directory</h2>
          <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary">
            <SlidersHorizontal size={14} />
            Sort
          </button>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No members found.</p>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-12 w-12 rounded-full border-2 border-primary/30 object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">CODE: {m.code}</p>
                    <p
                      className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${
                        m.status === 'Qualified' ? 'text-primary' : 'text-red-500'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          m.status === 'Qualified' ? 'bg-primary' : 'bg-red-500'
                        }`}
                      />
                      {m.status}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  {m.level}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Network Size</p>
                  <p className="font-bold text-gray-900">{m.networkSize} Members</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Commissions</p>
                  <p className="font-bold text-primary">₦{m.commissions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Level</p>
                  <p className="font-bold text-gray-900">{m.tier}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cashback</p>
                  <p className="font-bold text-rose-600">₦{m.cashback.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/referrals/members/${m.id}`)}
                  className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
                >
                  View Network
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/referrals/members/${m.id}`)}
                  className="flex-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700"
                >
                  View Earnings
                </button>
                <button
                  type="button"
                  aria-label="More actions"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ReferralBottomNav />
    </div>
  );
}