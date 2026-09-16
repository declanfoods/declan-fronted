import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Undo2,
  ShoppingCart,
  HandCoins,
  PiggyBank,
} from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import { findMockUser } from './mockUsers';

function formatNaira(n: number) {
  const sign = n < 0 ? '-' : n > 0 ? '+' : '';
  return `${sign}₦${Math.abs(n).toLocaleString()}.00`;
}

const iconMap = {
  order: ShoppingCart,
  topup: Landmark,
  referral: HandCoins,
  cashback: PiggyBank,
};

export default function UserFinancials() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = id ? findMockUser(id) : undefined;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">User not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Customer Financials</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="rounded-2xl bg-primary p-5 text-white">
          <p className="text-sm text-white/80">Wallet Summary</p>
          <p className="mt-1 text-3xl font-extrabold">₦{user.walletBalance.toLocaleString()}.00</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Cashback: ₦{user.cashback.toLocaleString()}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Ref: ₦{user.referralEarnings.toLocaleString()}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Pending: ₦{user.pendingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Financial Controls</h3>
            <button type="button" className="text-sm font-semibold text-primary">
              View Full History
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard size={18} />
              </span>
              <span className="text-xs font-semibold text-gray-700">Credit</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Landmark size={18} />
              </span>
              <span className="text-xs font-semibold text-gray-700">Debit</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <Undo2 size={18} />
              </span>
              <span className="text-xs font-semibold text-gray-700">Refund</span>
            </button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-base font-bold text-gray-900">Recent Transactions</h3>
          <div className="space-y-3">
            {user.transactions.map((t) => {
              const Icon = iconMap[t.icon];
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-400">
                      Ref: {t.ref} <span className="mx-1">•</span> {t.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.amount < 0 ? 'text-red-500' : 'text-primary'
                      }`}
                    >
                      {formatNaira(t.amount)}
                    </p>
                    <StatusPill label={t.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}