import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Inbox, ExternalLink } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import { useAdminPayoutRequests } from '../../../../app/hooks/useAdminReferrals';
import type { AdminPayoutRequest } from '../../../../app/lib/adminReferralApi';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Referral Payout → Queue  —  LIVE
|--------------------------------------------------------------------------
| This screen used to run on `mockPayoutRequests` behind a "Demo data —
| awaiting API" banner, because the backend had no payout routes. It called
| /admin/referrals/payouts*, which never existed.
|
| The backend has since shipped the "Admin Referrals > Referral Payout"
| folder. This is now wired to the real list and the badge is gone:
|
|   GET   /admin/referrals/withdrawal-requests
|   GET   /admin/referrals/withdrawal-requests/:id
|   PATCH /admin/referrals/withdrawal-requests/:id/approve
|   PATCH /admin/referrals/withdrawal-requests/:id/reject
|
| ⚠️ NOTES ON THE DATA
|   • `amount` is a STRING ("2000.00"), so every read goes through Number().
|   • The bank block is called `accountDetails` here, while the customer-side
|     endpoints call the same thing `bankDetails`. `bankOf()` handles both.
|   • Approve/Reject live on the DETAIL screen, not on these rows. That is
|     deliberate: approving moves money, so it should never be one tap away
|     on a scrolling list.
|
| FILTERS
|   The status tabs filter client-side on purpose. The collection documents no
|   query parameters on any endpoint, so `?requestStatus=` may be ignored by
|   the server. Filtering here means the tabs work regardless.
*/

const FILTERS = ['All Requests', 'Pending', 'Approved', 'Rejected', 'Cancelled'] as const;
type Filter = (typeof FILTERS)[number];

function naira(value: string | number | undefined) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function titleCase(value?: string) {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-rose-100 text-rose-600',
  APPROVED: 'bg-primary/10 text-primary',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function initialsOf(name?: string) {
  return (
    (name ?? '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function shortDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function matchesFilter(request: AdminPayoutRequest, filter: Filter) {
  if (filter === 'All Requests') return true;
  if (filter === 'Pending') return request.requestStatus === 'PENDING';
  if (filter === 'Approved') return request.requestStatus === 'APPROVED';
  if (filter === 'Rejected') return request.requestStatus === 'REJECTED';
  return request.requestStatus === 'CANCELLED';
}

export default function PayoutQueue() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>('All Requests');

  const queueQuery = useAdminPayoutRequests({ page: 1, limit: 50 });

  const allRequests = queueQuery.data?.payoutRequests ?? [];
  const filtered = allRequests.filter((r) => matchesFilter(r, activeFilter));

  // Counts come from the full list, not the filtered view, so the tabs can
  // show how much is waiting even while a different tab is active.
  const pendingCount = allRequests.filter((r) => r.requestStatus === 'PENDING').length;
  const pendingValue = allRequests
    .filter((r) => r.requestStatus === 'PENDING')
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-24">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
        <button
          type="button"
          onClick={() => queueQuery.refetch()}
          aria-label="Refresh"
          className="ml-auto text-primary-dark"
        >
          <RefreshCw size={18} className={queueQuery.isFetching ? 'animate-spin' : ''} />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Payout Requests</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review withdrawal requests from your referral network.
          </p>
        </div>

        {/* Awaiting-action summary */}
        {!queueQuery.isLoading && !queueQuery.isError && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-gray-400">
              AWAITING YOUR REVIEW
            </p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-3xl font-extrabold text-gray-900">{pendingCount}</p>
              <p className="text-sm font-bold text-primary">{naira(pendingValue)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
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

        {/* Loading */}
        {queueQuery.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}

        {/* Error */}
        {queueQuery.isError && !queueQuery.isLoading && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 text-center">
            <p className="text-sm font-semibold text-red-600">
              {getApiErrorMessage(queueQuery.error, 'Could not load payout requests.')}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">
              Request:{' '}
              <span className="font-mono">
                GET /admin/referrals/withdrawal-requests
              </span>
            </p>
            <button
              type="button"
              onClick={() => queueQuery.refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!queueQuery.isLoading && !queueQuery.isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <Inbox size={30} className="text-gray-300" />
            <p className="text-sm text-gray-400">
              {allRequests.length === 0
                ? 'No payout requests yet.'
                : 'No requests match this filter.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((r) => {
            const account = r.accountDetails;
            const tone = STATUS_TONE[r.requestStatus] ?? 'bg-gray-100 text-gray-500';

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/admin/referrals/queue/${r.id}`)}
                className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.user?.profilePictureUrl ? (
                      <img
                        src={r.user.profilePictureUrl}
                        alt={r.user.fullname}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initialsOf(r.user?.fullname)}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">
                        {r.user?.fullname ?? 'Unknown member'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {account?.bankName ?? '—'}{' '}
                        <span className="mx-1">•</span>
                        {account?.accountNumber
                          ? `••••${account.accountNumber.slice(-4)}`
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone}`}>
                    {titleCase(r.requestStatus)}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="text-lg font-extrabold text-primary">{naira(r.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{shortDate(r.createdAt)}</p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs font-semibold text-primary">
                      Review <ExternalLink size={11} />
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <ReferralBottomNav />
    </div>
  );
}
