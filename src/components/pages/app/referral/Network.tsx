import { Download, Share2, Wallet, User } from 'lucide-react';
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

export default function ReferralNetwork() {
  const codeQuery = useReferralCode();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const networksQuery = useReferralNetworks({ page: 1, limit: 50 });

  const firstName = deriveFirstName(codeQuery.data);
  const metrics = metricsQuery.data;
  const wallet = walletQuery.data;
  const referrals = networksQuery.data?.referrals ?? [];

  if (codeQuery.isLoading || networksQuery.isLoading) {
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
        totalReferrals={metrics?.totalNetwork ?? 0}
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
                {metrics?.totalNetwork ?? 0} Total Members
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
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      ₦{Number(r.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-ink-soft">Level 1</p>
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
              {metrics?.totalNetwork ?? 0}
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

            {levels.length === 0 && (
              <p className="text-xs text-ink-soft">No commission earned yet.</p>
            )}

            {levels.map((level, idx) => (
              <div key={level.level} className="flex flex-col items-center gap-4">
                {idx > 0 && <div className="h-6 w-0.5 bg-gray-300" />}
                <span
                  className={
                    'rounded-full px-4 py-1.5 text-xs font-bold ' +
                    (idx === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-ink')
                  }
                >
                  L{level.level}: {level.percentage}%
                </span>
              </div>
            ))}
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

        {/* Your Network */}
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Your Network</p>
          <div className="space-y-3">
            {referrals.length === 0 && (
              <p className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-ink-soft">
                Nobody has joined with your code yet.
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
    </ReferralLayout>
  );
}
