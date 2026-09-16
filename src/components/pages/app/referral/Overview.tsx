import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Copy,
  Share2,
  History,
  HelpCircle,
  Headphones,
  Bell,
} from 'lucide-react';
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
| Referral Overview — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: three Promise.allSettled calls in a useEffect, half of them
| hitting `userApi.getReferralsOverview()` which is a DIFFERENT (older)
| referral endpoint than the one referralApi was written for. Plus hardcoded
| mock numbers for wallet/monthly cashback/commission eligibility, and the
| "Review Activity" list was a literal `[1, 2, 3].map(...)` of fake rows.
|
| AFTER: four React Query hooks. Real wallet, real metrics, real recent
| referral activity. Zero mock constants left on this screen.
|
| Field mapping used:
|   referralCode         ← referralApi.getCode()      → data.code
|   firstName            ← referralApi.getCode()      → data.user.profile.firstName
|   totalNetwork         ← referralApi.getMetrics()   → metrics.totalNetwork
|   qualifiedCount       ← referralApi.getMetrics()   → metrics.qualifiedCount
|   level earnings       ← referralApi.getMetrics()   → networkPerformance.amountEarnedPerlevel[]
|   wallet balance       ← referralApi.getWallet()    → referralWallet.availableBalance
|   activity feed        ← referralApi.getNetworks()   → referrals[].fullname / joinedAt
*/

export default function ReferralOverview() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const codeQuery = useReferralCode();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const networksQuery = useReferralNetworks({ page: 1, limit: 5 });

  const isLoading =
    codeQuery.isLoading || walletQuery.isLoading || metricsQuery.isLoading;

  const firstName = deriveFirstName(codeQuery.data);
  const referralCode = codeQuery.data?.code ?? '';
  const shareLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const wallet = walletQuery.data;
  const metrics = metricsQuery.data;
  const recentReferrals = networksQuery.data?.referrals ?? [];

  const levelEarnings = metrics?.networkPerformance?.amountEarnedPerlevel ?? [];
  const totalEarned = metrics?.networkPerformance?.totalEarned ?? 0;

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure origin / permission) — nothing to do.
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Declan Foods',
          text: `Sign up on Declan Foods with my referral code: ${referralCode}`,
          url: shareLink,
        });
      } catch {
        // User dismissed the native share sheet.
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <ReferralLayout firstName={firstName}>
        <SplashLoader />
      </ReferralLayout>
    );
  }

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
        onShareLink={handleShare}
      >
        {/* Referral Code Card */}
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Your Referral Code</h3>

          <div className="mt-4 rounded-2xl bg-gray-50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-soft">Referral Code</p>
                <p className="mt-1 text-2xl font-bold text-primary">{referralCode || '—'}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="mt-4 text-sm font-bold text-primary">Referral Link:</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>
          </div>
        </section>

        {/* Perf Overview + Commission Breakdown */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary">Performance Overview</h3>
            <p className="mt-4 text-sm font-semibold text-ink">Network Summary</p>

            <div className="mt-3 space-y-4">
              <ProgressRow
                label="Total Network"
                value={`${metrics?.totalNetwork ?? 0} members`}
                progress={100}
              />
              <ProgressRow
                label="Qualified Members"
                value={`${metrics?.qualifiedCount ?? 0}/${metrics?.totalNetwork ?? 0}`}
                progress={
                  metrics?.totalNetwork
                    ? ((metrics.qualifiedCount ?? 0) / metrics.totalNetwork) * 100
                    : 0
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary">Commission Breakdown</h3>
            <div className="mt-4 space-y-3 text-sm">
              {levelEarnings.length === 0 && (
                <p className="text-ink-soft">No commission earned yet.</p>
              )}

              {levelEarnings.map((level) => (
                <BreakdownRow
                  key={level.level}
                  label={`Level ${level.level} (${level.percentage}%)`}
                  value={`₦${Number(level.amountEarned).toLocaleString()}`}
                />
              ))}

              {levelEarnings.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <BreakdownRow
                    label="Total Earned"
                    value={`₦${Number(totalEarned).toLocaleString()}`}
                    bold
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DesktopShell>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden space-y-4">
        {/* Wallet balance card */}
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
              className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary hover:bg-gray-100"
            >
              💸 Withdraw
            </button>
            <button
              onClick={() => navigate('/app/referrals/earnings')}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <History size={16} /> History
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-ink">{metrics?.totalNetwork ?? 0}</p>
            <p className="mt-1 text-xs text-ink-soft">Total Referrals</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-ink">{metrics?.qualifiedCount ?? 0}</p>
            <p className="mt-1 text-xs text-ink-soft">Qualified Members</p>
          </div>
        </div>

        {/* Grow your network */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-center">
            <p className="text-base font-bold text-primary">Grow Your Network</p>
            <p className="mt-1 text-xs text-ink-soft">
              Invite your friends and earn commission for every bulk purchase they make
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-gray-100 p-1.5">
            <input
              value={shareLink}
              readOnly
              className="flex-1 bg-transparent px-3 text-xs text-ink-soft outline-none"
            />
            <button
              onClick={handleCopy}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Wallet breakdown — replaces the two hardcoded progress bars */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">💰 Wallet</span>
            <span className="text-sm font-bold text-primary">
              ₦{Number(wallet?.availableBalance ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-soft">Pending</span>
              <span className="font-semibold text-primary">
                ₦{Number(wallet?.pendingBalance ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Lifetime Earned</span>
              <span className="font-semibold text-primary">
                ₦{Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Review Activity — now real referrals, newest first */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Recent Referrals</p>
            <button
              onClick={() => navigate('/app/referrals/list')}
              className="text-xs font-semibold text-primary"
            >
              View All
            </button>
          </div>

          {recentReferrals.length === 0 ? (
            <p className="rounded-xl bg-primary/5 p-4 text-center text-xs text-ink-soft">
              No referrals yet. Share your link to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {recentReferrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl bg-primary/5 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bell size={14} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">{r.fullname}</p>
                    <p className="text-xs text-ink-soft">
                      {r.commissionEligibilityStatus === 'ACTIVE'
                        ? 'Active — earning you commission'
                        : 'Signed up via your link'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary">
                      {new Date(r.joinedAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      ₦{Number(r.totalCommissionEarnedOnReferral ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/referrals/rewards-guide')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <HelpCircle size={24} className="text-primary" />
              <span className="text-sm font-semibold text-ink">How It Works</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5">
              <Headphones size={24} className="text-primary" />
              <span className="text-sm font-semibold text-ink">Help Center</span>
            </button>
          </div>
        </div>
      </div>
    </ReferralLayout>
  );
}

function ProgressRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-semibold text-primary">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-bold text-primary' : 'text-primary'}>{label}</span>
      <span className={bold ? 'font-bold text-primary' : 'text-primary'}>{value}</span>
    </div>
  );
}
