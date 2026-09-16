import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import { mockPayoutRequests, type PayoutRequest } from './mockReferralData';

const filters = ['All Requests', 'Pending', 'Processing', 'Successful'];

const statusStyles: Record<PayoutRequest['status'], string> = {
  PENDING: 'bg-rose-100 text-rose-600',
  PROCESSING: 'bg-gray-100 text-gray-500',
  SUCCESSFUL: 'bg-primary/10 text-primary',
};

export default function PayoutQueue() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Requests');

  const filtered = mockPayoutRequests.filter((r) => {
    if (activeFilter === 'All Requests') return true;
    if (activeFilter === 'Pending') return r.status === 'PENDING';
    if (activeFilter === 'Processing') return r.status === 'PROCESSING';
    if (activeFilter === 'Successful') return r.status === 'SUCCESSFUL';
    return true;
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
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Payout Requests</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and approve agent withdrawal earnings.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No requests here.</p>
          )}
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => navigate(`/admin/referrals/queue/${r.id}`)}
              className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <User size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      {r.bank} <span className="mx-1">•</span> {r.accountMasked}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusStyles[r.status]}`}>
                  {r.status}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="text-lg font-extrabold text-primary">
                    ₦{r.amount.toLocaleString()}.00
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{r.date}</p>
                  {r.status === 'PENDING' && (
                    <div className="mt-1 flex gap-2">
                      <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500">
                        Reject
                      </span>
                      <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                        Approve
                      </span>
                    </div>
                  )}
                  {r.status === 'PROCESSING' && r.note && (
                    <p className="mt-1 text-xs font-medium text-gray-500">{r.note}</p>
                  )}
                  {r.status === 'SUCCESSFUL' && (
                    <CheckCircle2 size={18} className="ml-auto mt-1 text-primary" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}