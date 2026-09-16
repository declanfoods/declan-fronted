import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, ChevronRight, ChevronRight as CaretRight } from 'lucide-react';
import { mockMemberDetails, type DirectReferral } from './mockReferralData';

const tabs = ['All', 'Qualified', 'Not Qualified', 'Active'];

function qualifiedBadge(status: DirectReferral['qualified']) {
  return status === 'QUALIFIED'
    ? 'bg-primary/10 text-primary'
    : 'bg-gray-100 text-gray-500';
}

export default function ReferralMemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('All');
  const detail = id ? mockMemberDetails[id] : undefined;

  if (!detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">Member not found in mock data.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/referrals/members')}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Members
        </button>
      </div>
    );
  }

  const filteredReferrals = detail.directReferrals.filter((r) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Qualified') return r.qualified === 'QUALIFIED';
    if (activeTab === 'Not Qualified') return r.qualified === 'NOT QUALIFIED';
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral Network</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <p className="text-sm text-gray-400">
          Referral Members <ChevronRight size={12} className="mx-1 inline" />
          <span className="font-semibold text-primary">{detail.name.split(' ')[0]}</span>
        </p>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={detail.avatarUrl}
                alt={detail.name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900">{detail.name}</p>
                <p className="text-xs text-gray-400">ID: {detail.refId}</p>
                <div className="mt-1 flex gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                    {detail.tier}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {detail.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Code</p>
              <p className="text-sm font-extrabold text-primary">{detail.code}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{detail.network}</p>
              <p className="text-[10px] text-gray-400">NETWORK</p>
            </div>
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{detail.directs}</p>
              <p className="text-[10px] text-gray-400">DIRECTS</p>
            </div>
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{detail.qualified}</p>
              <p className="text-[10px] text-gray-400">QUALIFIED</p>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Lifetime Comm.</p>
              <p className="font-bold text-gray-900">
                ₦{detail.lifetimeCommission.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Lifetime Rev.</p>
              <p className="font-bold text-primary">
                ₦{(detail.lifetimeRevenue / 1_000_000).toFixed(1)}M
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs italic text-gray-400">Joined: {detail.joined}</p>
        </div>

        <div className="flex gap-3 rounded-2xl bg-primary/10 p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm text-gray-700">
            {detail.name.split(' ')[0]} has referred {detail.directs} customers directly.{' '}
            {detail.qualified} are currently qualified for commissions this month.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-900">Direct Referrals</h2>
          <p className="mb-3 text-sm text-gray-400">
            Customers directly referred by {detail.name.split(' ')[0]}
          </p>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredReferrals.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No referrals in this view.</p>
            )}
            {filteredReferrals.map((r) => (
              <button
                key={r.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="relative">
                  <img
                    src={r.avatarUrl}
                    alt={r.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">
                    ID: {r.refId} <span className="mx-1">•</span> {r.levelLabel}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-gray-500">
                      Orders <span className="font-bold text-gray-900">{r.orders}</span>
                    </span>
                    <span className="text-gray-500">
                      Comm.{' '}
                      <span className="font-bold text-primary">
                        {r.commission > 0 ? `₦${r.commission.toLocaleString()}` : '₦0'}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      Network <span className="font-bold text-gray-900">{r.network}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {!r.hasDownlines && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                      NO DOWNLINES
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${qualifiedBadge(r.qualified)}`}
                  >
                    {r.qualified}
                  </span>
                  <CaretRight size={16} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}