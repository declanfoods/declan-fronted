import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Landmark, RotateCcw, XCircle, AlertTriangle, Check } from 'lucide-react';
import { mockPayoutDetails } from './mockReferralData';

export default function PayoutRequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const detail = id ? mockPayoutDetails[id] : undefined;

  if (!detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">
          Payout request not found (mock data only covers request p1).
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/referrals/queue')}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Payout Details</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Withdrawal Request</p>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <CheckCircle2 size={12} />
              Verified
            </span>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">
            ₦{detail.amount.toLocaleString()}.00
          </p>
          <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F7EE] text-primary">
              <Landmark size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {detail.bank} <span className="mx-1">•</span> {detail.accountNumber}
              </p>
              <p className="text-xs text-gray-400">{detail.fullName}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-primary p-4 text-white">
          <p className="text-xs text-white/80">TOTAL BALANCE</p>
          <p className="mt-1 text-2xl font-extrabold">₦{detail.totalBalance.toLocaleString()}.00</p>
          <div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-sm">
            <span className="text-white/80">Referrals</span>
            <span className="font-semibold">₦{detail.referralsBalance.toLocaleString()}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-white/80">Cashback</span>
            <span className="font-semibold">₦{detail.cashbackBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Request Timeline</h3>
          <div className="space-y-0">
            {detail.timeline.map((step, idx) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.done
                        ? 'bg-primary text-white'
                        : step.current
                        ? 'border-2 border-primary bg-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {step.done ? <Check size={12} /> : step.current ? (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  {idx < detail.timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-100" style={{ minHeight: '28px' }} />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={`text-sm font-bold ${
                      step.done || step.current ? 'text-gray-900' : 'text-gray-300'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.timestamp ?? 'Pending your review'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-gray-900">Previous Withdrawals</h3>
          <div className="grid grid-cols-2 gap-3">
            {detail.previousWithdrawals.map((w, idx) => (
              <div key={idx} className="rounded-xl bg-[#EDEFE6] p-3">
                <p className="font-bold text-gray-900">₦{w.amount.toLocaleString()}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {w.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-gray-900">Admin Actions</h3>
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#EDEFE6] p-4">
            <button type="button" className="flex flex-col items-center gap-1.5 text-gray-500">
              <RotateCcw size={18} />
              <span className="text-xs font-semibold">Processing</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1.5 text-primary">
              <CheckCircle2 size={18} />
              <span className="text-xs font-semibold">Successful</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1.5 text-red-500">
              <AlertTriangle size={18} />
              <span className="text-xs font-semibold">Failed</span>
            </button>
          </div>
        </div>
      </main>

      <div className="flex gap-3 px-5 pb-6 pt-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-300 py-3.5 text-sm font-semibold text-red-500"
        >
          <XCircle size={16} />
          Reject Request
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
        >
          <CheckCircle2 size={16} />
          Approve Now
        </button>
      </div>
    </div>
  );
}