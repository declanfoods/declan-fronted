import { useState } from 'react';
import { Download, Eye, Wallet, History, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import SplashLoader from '../../../ui/SplashLoader';
import {
  deriveFirstName,
  useReferralCode,
  useReferralMetrics,
  useReferralNetworks,
  useReferralWallet,
} from '../../../../app/hooks/useReferrals';
import type { DirectReferral } from '../../../../app/lib/referralApi';

/*
|--------------------------------------------------------------------------
| Direct Referrals list — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: it called BOTH `userApi.getReferralsOverview()` (old endpoint) and
| `referralApi.getReferrals()` (broken import) and merged the two results,
| then let whichever resolved last win. Nobody could tell which data was on
| screen. Loading state was a `finally { setLoading(false) }` that ran even
| when every request failed, so a network outage showed "No referrals yet."
| instead of an error.
|
| AFTER: one hook (`useReferralNetworks`) is the single source of truth,
| server-side paginated, with a real error state and a real empty state.
|
| Field mapping:
|   name        ← DirectReferral.fullname
|   joined      ← DirectReferral.joinedAt
|   orders      ← DirectReferral.numberOfOrders
|   commission  ← DirectReferral.totalCommissionEarnedOnReferral
|   qualified   ← DirectReferral.commissionEligibilityStatus === 'ACTIVE'
|   progress    ← DirectReferral.percentageReached
*/

type Filter = 'all' | 'active' | 'pending' | 'qualified';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'qualified', label: 'Qualified' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const PAGE_SIZE = 20;

export default function ReferralList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const codeQuery = useReferralCode();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const networksQuery = useReferralNetworks({ page, limit: PAGE_SIZE });

  const firstName = deriveFirstName(codeQuery.data);
  const metrics = metricsQuery.data;
  const wallet = walletQuery.data;

  if (codeQuery.isLoading || networksQuery.isLoading) {
    return (
      <ReferralLayout firstName={firstName}>
        <SplashLoader />
      </ReferralLayout>
    );
  }

  if (networksQuery.isError) {
    return (
      <ReferralLayout firstName={firstName}>
        <div className="py-16 text-center">
          <p className="text-sm text-ink-soft">
            We couldn't load your referrals. Please try again.
          </p>
          <button
            onClick={() => networksQuery.refetch()}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </ReferralLayout>
    );
  }

  const referrals = networksQuery.data?.referrals ?? [];
  const pagination = networksQuery.data?.pagination;

  // Filtering happens client-side over the current page, because the backend
  // /referrals/networks endpoint has no `search` or `status` query param yet.
  const filtered = referrals.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchesSearch = !q || (r.fullname ?? '').toLowerCase().includes(q);

    const isQualified = r.commissionEligibilityStatus === 'ACTIVE';
    const matchesFilter =
      filter === 'all' ||
      (filter === 'qualified' && isQualified) ||
      (filter === 'active' && isQualified && r.numberOfOrders > 0) ||
      (filter === 'pending' && !isQualified);

    return matchesSearch && matchesFilter;
  });

  return (
    <ReferralLayout firstName={firstName}>
      {/* ═══ DESKTOP VIEW ═══ */}
      <DesktopShell
        firstName={firstName}
        totalReferrals={metrics?.totalNetwork ?? 0}
        activeReferrals={metrics?.qualifiedCount ?? 0}
        totalEarnings={Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
        thisMonth={Number(wallet?.availableBalance ?? 0).toLocaleString()}
        pending={Number(wallet?.pendingBalance ?? 0).toLocaleString()}
      >
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">Direct Referrals</h3>
            <button className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">
                {referrals.length === 0
                  ? 'No referrals yet.'
                  : 'No referrals match this filter.'}
              </p>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{r.fullname}</p>
                    <p className="text-xs text-ink-soft">
                      Joined {formatDate(r.joinedAt)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {r.numberOfOrders} Orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ₦{Number(r.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-primary">
                      {Number(r.percentageReached ?? 0).toFixed(0)}% to qualification
                    </p>
                  </div>
                  <button className="text-primary" aria-label="View referral">
                    <Eye size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-gray-300 px-4 py-2 font-semibold text-ink disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-ink-soft">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-gray-300 px-4 py-2 font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </DesktopShell>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden space-y-4">
        {/* Wallet card */}
        <div className="rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            ₦{Number(wallet?.availableBalance ?? 0).toLocaleString()}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/referrals/withdraw')}
              className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary"
            >
              💸 Withdraw
            </button>
            <button
              onClick={() => navigate('/app/referrals/earnings')}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 py-2.5 text-sm font-semibold text-white"
            >
              <History size={16} /> History
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3">
          <Search size={18} className="text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Referrals (e.g. Funmi, Ebube)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ' +
                (filter === f.key
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 bg-white text-ink')
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Referral cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">
              {referrals.length === 0
                ? 'No referrals yet.'
                : 'No referrals match this filter.'}
            </p>
          ) : (
            filtered.map((r) => <MobileReferralCard key={r.id} referral={r} />)
          )}
        </div>

        {pagination && pagination.hasNextPage && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full rounded-full border border-primary py-3 text-sm font-semibold text-primary"
          >
            Load More
          </button>
        )}
      </div>
    </ReferralLayout>
  );
}

function MobileReferralCard({ referral }: { referral: DirectReferral }) {
  const initials =
    referral.fullname
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  const isQualified = referral.commissionEligibilityStatus === 'ACTIVE';
  const progress = Math.min(100, Math.max(0, referral.percentageReached ?? 0));
  const isActive = isQualified && referral.numberOfOrders > 0;
  const status = isQualified ? 'Qualified' : isActive ? 'Active' : 'Pending';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{referral.fullname}</p>
            <p className="text-xs text-ink-soft">
              Joined {formatDate(referral.joinedAt)}
            </p>
          </div>
        </div>
        <span
          className={
            'rounded-full px-3 py-1 text-xs font-semibold ' +
            (isQualified
              ? 'bg-primary text-white'
              : isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-orange-100 text-orange-700')
          }
        >
          {status}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-primary">
            {isQualified
              ? 'Goal Completed'
              : `Progression: ₦${Number(referral.commissionEligibilityThreshold ?? 0).toLocaleString()} threshold`}
          </span>
          <span className="font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-xs">
        <div>
          <p className="text-ink-soft">Orders</p>
          <p className="font-bold text-primary">{referral.numberOfOrders ?? 0}</p>
        </div>
        <div className="text-right">
          <p className="text-ink-soft">Total Rewards</p>
          <p className="font-bold text-primary">
            ₦{Number(referral.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
