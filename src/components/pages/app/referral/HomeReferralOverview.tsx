import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  HelpCircle,
  Headphones,
  Bell,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import SplashLoader from '../../../ui/SplashLoader';
import {
  useReferralCode,
  useReferralMetrics,
  useReferralNetworks,
  useReferralWallet,
} from '../../../../app/hooks/useReferrals';
import AppLayout from '../../../app/AppLayout';



export default function HomeReferralOverview() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const codeQuery = useReferralCode();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const networksQuery = useReferralNetworks({ page: 1, limit: 5 });

  const isLoading =
    codeQuery.isLoading || walletQuery.isLoading || metricsQuery.isLoading;


  const referralCode = codeQuery.data?.code ?? '';
  const shareLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const wallet = walletQuery.data;
  const metrics = metricsQuery.data;
  const recentReferrals = networksQuery.data?.referrals ?? [];

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


  if (isLoading) {
    return (
      <AppLayout title="My Referrals">
        <SplashLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Referrals">

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

  {/* Fill the space with wallet sub-stats */}
  <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
    <span>
      Pending:{' '}
      <span className="font-semibold text-white">
        ₦{Number(wallet?.pendingBalance ?? 0).toLocaleString()}
      </span>
    </span>
    <span>
      Lifetime:{' '}
      <span className="font-semibold text-white">
        ₦{Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
      </span>
    </span>
  </div>

  <button
    onClick={() => navigate('/app/referrals/withdraw')}
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary hover:bg-gray-100"
  >
    💸 Withdraw
  </button>
</div>

        <a
          href="/app/referrals"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-primary">Referral Dashboard</p>
              <p className="text-xs text-ink-soft">Full network, levels & earnings</p>
            </div>
          </div>
          <ArrowUpRight size={20} className="text-primary" />
        </a>

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

       
        {/* Review Activity — now real referrals, newest first */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Recent Referrals</p>
            <a
              href="/app/referrals/list"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View All <ArrowUpRight size={12} />
            </a>
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
    </AppLayout>
  );
}
