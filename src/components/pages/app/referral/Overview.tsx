import { useState, useEffect } from 'react';
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
import { userApi } from '../../../../app/lib/userApi';
import { referralApi } from '../../../../app/lib/referralApi';

export default function ReferralOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [firstName, setFirstName] = useState('John');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, codeRes, referralsRes] = await Promise.allSettled([
          userApi.getProfileOverview(),
          referralApi.getReferralCode(),
          userApi.getReferralsOverview(),
        ]);

        if (profileRes.status === 'fulfilled') {
          setFirstName(profileRes.value.data.data?.user?.profile?.firstName ?? 'John');
        }
        if (codeRes.status === 'fulfilled') {
          setReferralCode(codeRes.value.data.data?.referralCode ?? 'JOHN2026');
        }
        if (referralsRes.status === 'fulfilled') {
          const m = referralsRes.value.data.data.metrics;
          setTotalReferrals(m?.totalDirectReferrals ?? 0);
          setActiveReferrals(m?.totalActiveReferrals ?? 0);
          if (!referralCode && m?.referralCode) setReferralCode(m.referralCode);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const shareLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Declan Foods',
          text: `Sign up on Declan Foods with my referral code: ${referralCode}`,
          url: shareLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <ReferralLayout firstName={firstName}>
        <SplashLoader />
      </ReferralLayout>
    );
  }

  // Mock data for placeholder features
  const walletBalance = 25000;
  const monthlyCashback = 15000;
  const monthlyTarget = 25000;
  const currentCommission = 25000;
  const commissionTarget = 40000;

  return (
    <ReferralLayout firstName={firstName}>
      {/* ═══ DESKTOP VIEW ═══ */}
      <DesktopShell
        firstName={firstName}
        totalReferrals={totalReferrals}
        activeReferrals={activeReferrals}
        totalEarnings="80,000"
        thisMonth="80,000"
        pending="80,000"
        onShareLink={handleShare}
      >
        {/* Referral Code Card */}
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Your Referral Code</h3>

          <div className="mt-4 rounded-2xl bg-gray-50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-soft">Referral Code</p>
                <p className="mt-1 text-2xl font-bold text-primary">{referralCode}</p>
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
            <p className="mt-4 text-sm font-semibold text-ink">Monthly Target</p>

            <div className="mt-3 space-y-4">
              <ProgressRow label="Referral Target (10)" value="4/10" progress={40} />
              <ProgressRow
                label="Earning Target ₦5000"
                value="₦1,500/₦5000"
                progress={30}
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary">Commission Breakdown</h3>
            <div className="mt-4 space-y-3 text-sm">
              <BreakdownRow label="Level 1 (1.5%)" value="₦5000" />
              <BreakdownRow label="Level 2 (0.75%)" value="₦280" />
              <BreakdownRow label="Level 2 (0.375%)" value="₦145" />
              <div className="border-t border-gray-200 pt-3">
                <BreakdownRow label="Total This Month" value="₦5000" bold />
              </div>
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
          <p className="mt-2 text-3xl font-bold">₦{walletBalance.toLocaleString()}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/referrals/withdraw')}
              className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary hover:bg-gray-100"
            >
              💸 Withdraw
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              <History size={16} /> History
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-ink">{totalReferrals}</p>
            <p className="mt-1 text-xs text-ink-soft">Total Referrals</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-ink">{activeReferrals}</p>
            <p className="mt-1 text-xs text-ink-soft">Active Members</p>
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

        {/* Cashback progress */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">💰 Monthly Cashback</span>
            <span className="text-sm font-bold text-primary">
              ₦{monthlyCashback.toLocaleString()}/₦{monthlyTarget.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(monthlyCashback / monthlyTarget) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            ₦{(monthlyTarget - monthlyCashback).toLocaleString()} more to unlock monthly bonus
          </p>
        </div>

        {/* Commission Eligibility */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              🎓 Commission Eligibility
            </span>
            <span className="text-sm font-bold text-primary">75% Complete</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(currentCommission / commissionTarget) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-soft">
            <span>Current: ₦{currentCommission.toLocaleString()}</span>
            <span>Target: ₦{commissionTarget.toLocaleString()}</span>
          </div>
        </div>

        {/* Review Activity */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Review Activity</p>
            <button className="text-xs font-semibold text-primary">View All</button>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-primary/5 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bell size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">
                    Referral: Chidi Okoro
                  </p>
                  <p className="text-xs text-ink-soft">New sign-up via your link</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary">Today</p>
                  <p className="text-xs font-semibold text-primary">+₦0.00</p>
                </div>
              </div>
            ))}
          </div>
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
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
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
