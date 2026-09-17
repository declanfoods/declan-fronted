import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Undo2,
  ShoppingCart,
  HandCoins,
  PiggyBank,
  RefreshCw,
} from 'lucide-react';
import StatusPill from '../../../admin/StatusPill';
import {
  useAdminUser,
  useAdminUserTransactions,
  useAdminUserWallet,
} from '../../../../app/hooks/useAdminUsers';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import type { AdminUserTransaction } from '../../../../app/lib/adminUserApi';

/*
|--------------------------------------------------------------------------
| Admin → Customer Financials — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: `findMockUser(id)` again → always blank in production.
|
| AFTER:
|   Wallet summary  ← adminUserApi.getUserWallet(id)        → { balance, pendingBalance, lifetimeEarned }
|   Transactions    ← adminUserApi.getUserTransactions(id)  → paginated list
|
| Icon is chosen from `transactionFor` (what the money moved for) with a
| fallback to CREDIT/DEBIT, replacing the mock `icon` field that no longer
| exists.
*/

function formatSignedNaira(amount: string | number, isDebit: boolean) {
  const sign = isDebit ? '-' : '+';
  return `${sign}₦${Math.abs(Number(amount ?? 0)).toLocaleString()}.00`;
}

function iconFor(tx: AdminUserTransaction) {
  const source = `${tx.transactionFor ?? ''}`.toUpperCase();

  if (source.includes('ORDER')) return ShoppingCart;
  if (source.includes('REFERRAL') || source.includes('COMMISSION')) return HandCoins;
  if (source.includes('CASHBACK')) return PiggyBank;

  return tx.transactionType === 'DEBIT' ? Landmark : CreditCard;
}

/*
  This is a RECENT transactions list, not a full ledger — 5 is enough to show
  the shape of a customer's activity, and the endpoint takes ?limit=5.
  It uses GET /api/v1/admin/users/:id/transactions (the normal transactions
  endpoint) rather than the referral-transactions one.
*/
const RECENT_LIMIT = 5;

export default function UserFinancials() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const userQuery = useAdminUser(id);
  const walletQuery = useAdminUserWallet(id);
  const transactionsQuery = useAdminUserTransactions(id, {
    page,
    limit: RECENT_LIMIT,
  });

  const user = userQuery.data;
  const wallet = walletQuery.data;
  const transactions = transactionsQuery.data?.transactions ?? [];
  const pagination = transactionsQuery.data?.pagination;

  if (userQuery.isLoading || walletQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-gray-500">
          {userQuery.isError
            ? getApiErrorMessage(userQuery.error, 'Could not load this customer.')
            : 'Customer not found.'}
        </p>
        <button
          type="button"
          onClick={() => userQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw size={14} /> Retry
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
        <h1 className="text-lg font-bold text-primary-dark">Customer Financials</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="rounded-2xl bg-primary p-5 text-white">
          <p className="text-sm font-semibold">{user.fullname}</p>
          <p className="mt-2 text-sm text-white/80">Wallet Summary</p>

          <p className="mt-1 text-3xl font-extrabold">
            {walletQuery.isError
              ? '—'
              : `₦${Number(wallet?.balance ?? 0).toLocaleString()}.00`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Pending: ₦{Number(wallet?.pendingBalance ?? 0).toLocaleString()}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Lifetime Earned: ₦{Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Financial Controls</h3>
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

          {/* ⚠️ These three have no backend endpoint yet — see the report.
              POST /admin/users/:id/wallet/credit | debit | refund */}
          <p className="mt-2 text-[11px] text-gray-400">
            Manual credit / debit / refund are not connected yet — awaiting backend
            endpoints.
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Recent Transactions</h3>
            {pagination && (
              <span className="text-xs text-gray-400">
                {pagination.totalItems} total
              </span>
            )}
          </div>

          {transactionsQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          )}

          {transactionsQuery.isError && (
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-sm text-gray-500">Could not load transactions.</p>
              <button
                type="button"
                onClick={() => transactionsQuery.refetch()}
                className="mt-3 text-sm font-semibold text-primary"
              >
                Retry
              </button>
            </div>
          )}

          {!transactionsQuery.isLoading &&
            !transactionsQuery.isError &&
            transactions.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
                No transactions yet.
              </p>
            )}

          <div className="space-y-3">
            {transactions.map((t) => {
              const Icon = iconFor(t);
              const isDebit = t.transactionType === 'DEBIT';

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {t.description || t.transactionFor}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      Ref: {t.reference} <span className="mx-1">•</span>{' '}
                      {new Date(t.createdAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isDebit ? 'text-red-500' : 'text-primary'
                      }`}
                    >
                      {formatSignedNaira(t.amount, isDebit)}
                    </p>
                    <StatusPill label={t.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}