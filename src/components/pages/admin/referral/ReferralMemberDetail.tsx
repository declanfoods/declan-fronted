import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, ChevronRight, RefreshCw } from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import {
  useUserDirectReferrals,
  useUserReferralMetrics,
} from '../../../../app/hooks/useAdminReferrals';
import { useAdminUser } from '../../../../app/hooks/useAdminUsers';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import type { UserReferralMetricItem } from '../../../../app/lib/adminReferralApi';

/*
|--------------------------------------------------------------------------
| Admin → Referral Member Detail ("View Member Network")
|--------------------------------------------------------------------------
| BEFORE: `mockMemberDetails[id]` — a hardcoded map containing only key "1".
| Any other member showed "Member not found in mock data."
|
| THEN: wired to the API, but the whole page was gated on ONE call —
| `GET /admin/users/:id`. If that single request failed, the entire screen
| showed an error and the member's network was unreachable, even though the
| referral endpoints were answering fine. That is what "view member network
| no dey work" was.
|
| NOW: `GET /admin/referrals/users/:id/metrics` is the PRIMARY source. It
| returns fullname, profilePictureUrl, activeStatus, referralCode, joinedAt
| AND the metric tiles — everything this header renders — so the page stands
| on its own. `GET /admin/users/:id` is optional enrichment (it adds the full
| ID and live account status) and its failure is now non-fatal.
|
| Also: every id is read defensively. `r.id.slice(0, 8)` used to throw and
| blank the screen when a row arrived without an id.
|
| ⚠️ DATA QUIRK — handled, do not "clean up":
|   `totalNumberOfOrders` is a plain number (0) for NOT-QUALIFIED members but
|   an OBJECT { totalNumberOfOrders, totalOrderValue } for QUALIFIED ones.
|   `readOrderCount()` / `readOrderValue()` below normalise both forms.
|
| Tabs map to `commissionEligibilityStatus`: 'QUALIFIED' | 'NOT QUALIFIED'.
| 'Active' filters on whether the member has placed any orders.
*/

const TABS = ['All', 'Qualified', 'Not Qualified', 'Active'] as const;
type Tab = (typeof TABS)[number];

/** Handles the `number | { totalNumberOfOrders, totalOrderValue }` union. */
function readOrderCount(value: UserReferralMetricItem['totalNumberOfOrders']): number {
  if (typeof value === 'number') return value;
  return Number(value?.totalNumberOfOrders ?? 0);
}

function readOrderValue(value: UserReferralMetricItem['totalNumberOfOrders']): number {
  if (typeof value === 'number') return 0;
  return Number(value?.totalOrderValue ?? 0);
}

function qualifiedBadge(status: UserReferralMetricItem['commissionEligibilityStatus']) {
  return status === 'QUALIFIED'
    ? 'bg-primary/10 text-primary'
    : 'bg-gray-100 text-gray-500';
}

/** Two-letter avatar initials that never throws on a missing name. */
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

/** Short, safe display id — tolerates a missing/empty id without crashing. */
function shortId(id?: string) {
  return id ? `ID: ${id.slice(0, 8)}` : 'ID: —';
}

function naira(value: number) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

export default function ReferralMemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('All');

  // Primary — carries the header AND the metric tiles.
  const summaryQuery = useUserReferralMetrics(id);
  // The direct-referral network list.
  const directQuery = useUserDirectReferrals(id);
  // Optional enrichment only. Never gates the page.
  const userQuery = useAdminUser(id);

  const summary = summaryQuery.data;
  const user = userQuery.data;
  const summaryMetrics = summary?.metrics;
  const referrals = directQuery.data?.referrals ?? [];

  /*
    Header values, resolved in priority order:
      1. the referral summary (always present on this screen)
      2. the optional user record (adds live account status)
    So the page renders even when /admin/users/:id is down.
  */
  const displayName = summary?.fullname ?? user?.fullname ?? '';
  const avatarUrl = summary?.profilePictureUrl || user?.profilePictureUrl || '';
  const referralCode = summary?.referralCode ?? user?.referralCode ?? '';
  const joinedAt = summary?.joinedAt ?? user?.joinedAt ?? '';
  const accountStatus = summary?.activeStatus ?? user?.userStatus ?? '';
  const displayId = summary?.id ?? user?.id ?? id;

  const filteredReferrals = referrals.filter((r) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Qualified') return r.commissionEligibilityStatus === 'QUALIFIED';
    if (activeTab === 'Not Qualified')
      return r.commissionEligibilityStatus === 'NOT QUALIFIED';

    return readOrderCount(r.totalNumberOfOrders) > 0;
  });

  const qualifiedCount =
    summaryMetrics?.qualified ??
    referrals.filter((r) => r.commissionEligibilityStatus === 'QUALIFIED').length;

  const lifetimeCommission =
    summaryMetrics?.lifetimeCommission ??
    referrals.reduce((sum, r) => sum + Number(r.totalCommissionEarnedOnReferral ?? 0), 0);

  const lifetimeRevenue =
    summaryMetrics?.lifetimeRevenue ??
    referrals.reduce((sum, r) => sum + readOrderValue(r.totalNumberOfOrders), 0);

  const networkSize =
    summaryMetrics?.network ??
    referrals.reduce((sum, r) => sum + Number(r.totalNetwork ?? 0), 0);

  const directCount = summaryMetrics?.directReferrals ?? referrals.length;

  const first = displayName.split(' ')[0] || 'This member';

  /*
    FATAL only when BOTH sources failed. If either one answers, we can render
    a useful screen — which is the whole point of the rewrite.
  */
  const bothFailed = summaryQuery.isError && userQuery.isError;
  const isLoading =
    (summaryQuery.isLoading && userQuery.isLoading) ||
    summaryQuery.isLoading ||
    userQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (bothFailed || (!displayName && !summary)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-center text-sm text-gray-500">
          {getApiErrorMessage(
            summaryQuery.error ?? userQuery.error,
            'Could not load this member.'
          )}
        </p>

        <p className="max-w-sm text-center text-xs text-gray-400">
          Tried:{' '}
          <span className="font-mono">GET /admin/referrals/users/{id}/metrics</span> and{' '}
          <span className="font-mono">GET /admin/users/{id}</span>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              summaryQuery.refetch();
              userQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700"
          >
            <RefreshCw size={14} /> Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/referrals/members')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral Network</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        <p className="text-sm text-gray-400">
          Referral Members <ChevronRight size={12} className="mx-1 inline" />
          <span className="font-semibold text-primary">{first}</span>
        </p>

        {/* Banner if the optional enrichment call failed — the page still works. */}
        {userQuery.isError && !bothFailed && (
          <p className="rounded-2xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
            Account details are unavailable right now, so this shows referral data only.
          </p>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                  {initialsOf(displayName)}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{displayName || 'Unknown member'}</p>
                <p className="text-xs text-gray-400">{shortId(displayId)}</p>
                {accountStatus && (
                  <div className="mt-1 flex gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {accountStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Code</p>
              <p className="text-sm font-extrabold text-primary">{referralCode || '—'}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{directCount}</p>
              <p className="text-[10px] text-gray-400">DIRECTS</p>
            </div>
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{networkSize}</p>
              <p className="text-[10px] text-gray-400">NETWORK</p>
            </div>
            <div className="rounded-xl bg-[#F3F7EE] py-2">
              <p className="text-lg font-extrabold text-gray-900">{qualifiedCount}</p>
              <p className="text-[10px] text-gray-400">QUALIFIED</p>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Lifetime Comm.</p>
              <p className="font-bold text-gray-900">{naira(lifetimeCommission)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Lifetime Rev.</p>
              <p className="font-bold text-primary">
                {lifetimeRevenue > 0
                  ? `₦${(lifetimeRevenue / 1_000_000).toFixed(1)}M`
                  : '—'}
              </p>
            </div>
          </div>

          {joinedAt && (
            <p className="mt-2 text-xs italic text-gray-400">
              Joined:{' '}
              {new Date(joinedAt).toLocaleDateString('en-NG', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl bg-primary/10 p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm text-gray-700">
            {first} has referred {directCount} customers directly. {qualifiedCount} are
            currently qualified for commissions.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-900">Direct Referrals</h2>
          <p className="mb-3 text-sm text-gray-400">
            Customers directly referred by {first}
          </p>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((t) => (
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

          {directQuery.isError && (
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                {getApiErrorMessage(directQuery.error, "Could not load this member's network.")}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Request:{' '}
                <span className="font-mono">
                  GET /admin/referrals/users/{id}/direct-referrals
                </span>
              </p>
              <button
                type="button"
                onClick={() => directQuery.refetch()}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            {directQuery.isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
                ))}
              </>
            )}

            {filteredReferrals.length === 0 &&
              !directQuery.isError &&
              !directQuery.isLoading && (
                <p className="py-6 text-center text-sm text-gray-400">
                  {referrals.length === 0
                    ? `${first} has no direct referrals yet.`
                    : 'No referrals in this view. Try another tab.'}
                </p>
              )}

            {filteredReferrals.map((r) => {
              const orders = readOrderCount(r.totalNumberOfOrders);
              const commission = Number(r.totalCommissionEarnedOnReferral ?? 0);
              const isQualified = r.commissionEligibilityStatus === 'QUALIFIED';

              return (
                <div
                  key={r.id}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initialsOf(r.fullname)}
                    </div>
                    {isQualified && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-gray-900">
                      {r.fullname || 'Unknown member'}
                    </p>
                    <p className="truncate text-xs text-gray-400">{shortId(r.id)}</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span className="text-gray-500">
                        Orders <span className="font-bold text-gray-900">{orders}</span>
                      </span>
                      <span className="text-gray-500">
                        Comm.{' '}
                        <span className="font-bold text-primary">{naira(commission)}</span>
                      </span>
                      <span className="text-gray-500">
                        Network{' '}
                        <span className="font-bold text-gray-900">{r.totalNetwork ?? 0}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {(r.totalNetwork ?? 0) === 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                        NO DOWNLINES
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${qualifiedBadge(
                        r.commissionEligibilityStatus
                      )}`}
                    >
                      {r.commissionEligibilityStatus ?? 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <ReferralBottomNav />
    </div>
  );
}
