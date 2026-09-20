import { useState } from 'react';
import { Download, Share2, Wallet, User, MessageCircle } from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import SplashLoader from '../../../ui/SplashLoader';
import {
  deriveFirstName,
  useReferralCode,
  useReferralMetrics,
  useReferralWallet,
  useReferralTree,
  useReferralsAtLevel,
} from '../../../../app/hooks/useReferrals';
/*
  ⚠️ MERGE NOTE — these three imports and everything they drive come from the
  `zion/fixes` messaging feature, which landed on feature/ezekiel-branch AFTER
  this screen was rewritten for the referral tree. They are the developer's
  work, preserved here so the interactive tree does not clobber them.
*/
import type { DirectReferral } from '../../../../app/lib/referralApi';
import MessageModal from '../../../ui/MessageModal';

/*
|--------------------------------------------------------------------------
| Referral Network (tree view) — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE:
|  - Imported `ReferralPerson` from referralApi — a type that no longer
|    existed after the file was rewritten → hard compile error TS2614.
|  - Called `userApi.getReferralsOverview()` (the OLD referral contract).
|  - Hardcoded ₦25,000 wallet, 128 total network, 100 qualified, ₦29,500 level
|    earnings, and every "Network Performance" bar was a flat width: '60%'.
|
| AFTER: real network tree from `useReferralNetworks()`, real per-level
| earnings from `useReferralMetrics().networkPerformance.amountEarnedPerlevel`,
| real wallet. The per-level bars scale against the highest-earning level
| instead of being a constant 60%.
*/

/*
  Formats a commission rate for a level chip.

  The API sends these as decimals: 1, 0.25, 0.125, 0.0625, 0.0313. Printed
  raw, "0.0625%" is unreadable and "1%" vs "1.000%" is inconsistent. So:
    integers stay whole          1        → "1"
    otherwise trim trailing zeros 0.2500  → "0.25"
    cap at 4 decimals             0.0625  → "0.0625", 0.03125 → "0.0313"

  Returns a string with no percent sign — the caller adds it.
*/
function formatCommissionRate(rate: number | null | undefined): string {
  const n = Number(rate);

  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return String(n);

  // toFixed(4) then strip trailing zeros keeps 0.0313 readable without
  // turning 0.25 into 0.2500.
  return parseFloat(n.toFixed(4)).toString();
}

export default function ReferralNetwork() {
  const codeQuery = useReferralCode();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const treeQuery = useReferralTree();

  /*
    Which level the customer is looking at.

    DEFAULT IS 1 — the Network tab opens on the direct referrals, per request:
    "When user click the network tabs it should load all the direct referrals
    (i.e level 1 referrals) that the user has".

    Tapping a chip in the ladder changes this, which swaps both the green
    highlight AND the list underneath in one move, because the list is driven
    by the same value.
  */
  const [selectedLevel, setSelectedLevel] = useState(1);

  /*
    Which referral the messaging modal is open for, or null when it is closed.

    Reached from the message button on a card. Works for any level: the modal
    only needs `fullname` and `phoneNumber`, and a tree-level referral carries
    both — so a level-3 member can be messaged exactly like a direct one.
  */
  const [messageTarget, setMessageTarget] = useState<DirectReferral | null>(null);

  const levelQuery = useReferralsAtLevel(selectedLevel, { page: 1, limit: 50 });

  const firstName = deriveFirstName(codeQuery.data);
  const metrics = metricsQuery.data;
  const wallet = walletQuery.data;

  /*
    The ladder comes from GET /referrals/tree. Falling back to the metrics
    per-level array keeps the screen usable if the tree call fails — that
    array only lists levels that have earned, so it can be short, but a short
    ladder beats an empty screen.
  */
  const treeLevels =
    treeQuery.data?.tree ??
    (metrics?.networkPerformance?.amountEarnedPerlevel ?? []).map((l) => ({
      level: l.level,
      commissionPercentage: l.percentage,
      numberOfReferrals: 0,
    }));

  const totalNetwork = treeQuery.data?.totalNetwork ?? metrics?.totalNetwork ?? 0;

  // The people at the selected level.
  const referrals = levelQuery.data?.referrals ?? [];
  const levelPagination = levelQuery.data?.pagination;

  if (codeQuery.isLoading || treeQuery.isLoading) {
    return (
      <ReferralLayout firstName={firstName}>
        <SplashLoader />
      </ReferralLayout>
    );
  }

  const levels = metrics?.networkPerformance?.amountEarnedPerlevel ?? [];
  const maxLevelEarning = Math.max(1, ...levels.map((l) => Number(l.amountEarned ?? 0)));

  return (
    <ReferralLayout firstName={firstName}>
      {/* ═══ DESKTOP VIEW ═══ */}
      <DesktopShell
        firstName={firstName}
        totalReferrals={totalNetwork}
        activeReferrals={metrics?.qualifiedCount ?? 0}
        totalEarnings={Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
        thisMonth={Number(wallet?.availableBalance ?? 0).toLocaleString()}
        pending={Number(wallet?.pendingBalance ?? 0).toLocaleString()}
      >
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Share2 size={20} className="text-primary" /> Network Tree
              </h3>
              <p className="mt-1 text-sm text-ink-soft">Your complete referral network</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                {totalNetwork} Total Members
              </span>
              <button className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50">
                <Download size={16} /> Export Tree
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {/* You (root) */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-primary p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl text-primary">−</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {(firstName[0] ?? 'Y').toUpperCase()}
                </div>
                <span className="text-sm font-bold text-ink">You</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  ₦{Number(metrics?.networkPerformance?.totalEarned ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-ink-soft">All levels</p>
              </div>
            </div>

            {/* Level 1 children */}
            <div className="ml-8 space-y-2 border-l-2 border-primary/30 pl-4">
              {referrals.length === 0 && (
                <p className="py-4 text-sm text-ink-soft">
                  No one in your network yet.
                </p>
              )}

              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-primary">−</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {r.fullname
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{r.fullname}</p>
                      <p className="text-xs text-ink-soft">
                        {r.numberOfOrders} orders •{' '}
                        {r.commissionEligibilityStatus === 'ACTIVE'
                          ? 'Qualified'
                          : `${Math.round(r.percentageReached ?? 0)}% to qualify`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/*
                      Message this referral. The dev's button — same markup and
                      classes on both views so the desktop tree and the mobile
                      cards behave identically.

                      Guarded on `phoneNumber` because MessageModal calls
                      `.replace()` on it unconditionally: a referral whose
                      payload has no number would crash the modal on open.
                      Hiding the button is the smaller surprise. If the backend
                      ever guarantees the field, the guard can go.
                    */}
                    {r.phoneNumber && (
                      <button
                        type="button"
                        onClick={() => setMessageTarget(r)}
                        aria-label={`Message ${r.fullname}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                  border border-primary/30 bg-primary/5 text-primary
                                  hover:bg-primary/15 active:scale-95"
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}

                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        ₦{Number(r.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-ink-soft">Level {selectedLevel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </DesktopShell>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden space-y-4">
        {/* Wallet balance */}
        <div className="rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            ₦{Number(wallet?.availableBalance ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-white/80">Lifetime Earnings</p>
          <p className="text-sm font-semibold">
            ₦{Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-primary">Total Network</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {totalNetwork}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-primary">Qualified</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {metrics?.qualifiedCount ?? 0}
            </p>
          </div>
        </div>

        {/* Referral Journey */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-base font-bold text-ink">Referral Journey</p>
          <p className="mt-1 text-xs text-ink-soft">
            The deeper your referral network grows, the more passive income you earn.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <User size={20} className="text-white" />
            </div>

            {treeLevels.length === 0 && (
              <p className="text-xs text-ink-soft">
                Your referral tree is still empty.
              </p>
            )}

            {/*
              INTERACTIVE LADDER.

              Each chip is a button. Tapping one moves the green highlight to
              that level AND swaps the "Your Network" list underneath to the
              people at that level — one state value, `selectedLevel`, drives
              both. Previously only index 0 was ever green, so the ladder was
              decoration.

              The percentage is `commissionPercentage` from GET /referrals/tree
              (1 → "1%", 0.25 → "0.25%"), not an earnings figure and not a
              progress bar.
            */}
            {treeLevels.map((level, idx) => {
              const isSelected = level.level === selectedLevel;

              return (
                <div key={level.level} className="flex flex-col items-center gap-4">
                  {idx > 0 && (
                    <div
                      className={
                        'h-6 w-0.5 ' +
                        (level.level <= selectedLevel ? 'bg-primary' : 'bg-gray-300')
                      }
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedLevel(level.level)}
                    aria-pressed={isSelected}
                    aria-label={`Level ${level.level}, ${formatCommissionRate(
                      level.commissionPercentage
                    )} percent, ${level.numberOfReferrals} referrals`}
                    className={
                      'rounded-full px-4 py-1.5 text-xs font-bold transition-colors ' +
                      (isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-ink hover:bg-primary/10')
                    }
                  >
                    L{level.level}: {formatCommissionRate(level.commissionPercentage)}%
                    {level.numberOfReferrals > 0 && (
                      <span
                        className={
                          'ml-1.5 font-semibold ' +
                          (isSelected ? 'text-white/80' : 'text-ink-soft')
                        }
                      >
                        · {level.numberOfReferrals}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Network Performance — bars now scale to the real max */}
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Network Performance</p>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            {levels.length === 0 && (
              <p className="text-xs text-ink-soft">No earnings recorded yet.</p>
            )}

            {levels.map((level) => (
              <div key={level.level}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    Level {level.level}
                    {level.level === 1 ? ' (Direct)' : ''}
                  </span>
                  <span className="font-bold text-primary">
                    ₦{Number(level.amountEarned ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(Number(level.amountEarned ?? 0) / maxLevelEarning) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Network — the people at the SELECTED level */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">
              Your Network
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                Level {selectedLevel}
                {selectedLevel === 1 ? ' · Direct' : ''}
              </span>
            </p>

            {(levelPagination?.totalItems ?? referrals.length) > 0 && (
              <span className="text-xs text-ink-soft">
                {levelPagination?.totalItems ?? referrals.length}{' '}
                {(levelPagination?.totalItems ?? referrals.length) === 1
                  ? 'person'
                  : 'people'}
              </span>
            )}
          </div>

          {/* Loading this level — keep the previous level's cards visible */}
          {levelQuery.isFetching && referrals.length > 0 && (
            <p className="mb-2 text-center text-xs font-medium text-primary animate-pulse">
              Loading level {selectedLevel}...
            </p>
          )}

          {/* This level failed but others may not have */}
          {levelQuery.isError && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-sm text-ink-soft">
                Could not load level {selectedLevel}.
              </p>
              <button
                type="button"
                onClick={() => levelQuery.refetch()}
                className="mt-2 text-sm font-semibold text-primary"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            {/*
              The empty message is level-specific now. "Nobody has joined with
              your code yet" only makes sense for level 1 — at level 4 it was
              simply wrong, and would have read as "you have no network" while
              the customer was looking at a level-1 list of ten people.
            */}
            {!levelQuery.isLoading &&
              !levelQuery.isError &&
              referrals.length === 0 && (
                <p className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-ink-soft">
                  {selectedLevel === 1
                    ? 'Nobody has joined with your code yet.'
                    : `Nobody in your network has reached level ${selectedLevel} yet.`}
                </p>
              )}

            {referrals.slice(0, 3).map((r) => {
              const isPending = r.commissionEligibilityStatus !== 'ACTIVE';
              const progress = Math.min(100, Math.max(0, r.percentageReached ?? 0));

              return (
                <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {r.fullname
                          ?.split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{r.fullname}</p>
                        <p className="text-xs text-ink-soft">
                          Joined{' '}
                          {new Date(r.joinedAt).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {/*
                      Message this referral. The dev's button — same markup and
                      classes on both views so the desktop tree and the mobile
                      cards behave identically.

                      Guarded on `phoneNumber` because MessageModal calls
                      `.replace()` on it unconditionally: a referral whose
                      payload has no number would crash the modal on open.
                      Hiding the button is the smaller surprise. If the backend
                      ever guarantees the field, the guard can go.
                    */}
                    {r.phoneNumber && (
                      <button
                        type="button"
                        onClick={() => setMessageTarget(r)}
                        aria-label={`Message ${r.fullname}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                  border border-primary/30 bg-primary/5 text-primary
                                  hover:bg-primary/15 active:scale-95"
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}
                    <span
                      className={
                        'rounded-full px-3 py-1 text-xs font-semibold ' +
                        (isPending
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-primary/20 text-primary')
                      }
                    >
                      {isPending ? 'Pending' : 'Active'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-ink-soft">
                      {isPending
                        ? `Awaiting first purchase (₦${Number(r.commissionEligibilityThreshold ?? 0).toLocaleString()} threshold)`
                        : `Progression: ${Math.round(progress)}%`}
                    </p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-xs">
                    <div>
                      <p className="text-ink-soft">Orders</p>
                      <p className="font-bold text-primary">{r.numberOfOrders ?? 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ink-soft">
                        {isPending ? 'Potential Rewards' : 'Total Rewards'}
                      </p>
                      <p className="font-bold text-primary">
                        ₦
                        {Number(r.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/*
        Rendered once, outside the mobile/desktop split, so whichever view is
        visible shares the same modal. The dev placed it inside the mobile
        block; hoisting it here covers the desktop tree too.
      */}
      {messageTarget && (
        <MessageModal
          referral={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </ReferralLayout>
  );
}