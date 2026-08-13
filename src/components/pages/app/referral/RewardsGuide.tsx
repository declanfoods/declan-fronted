import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import ReferralLayout from './ReferralLayout';

const STEPS = [
  {
    step: 'Step 1',
    badge: '₦100 Reward',
    title: 'Refer a User',
    desc: 'Invite a friend to join the Declan Foods Network using your unique link.',
  },
  {
    step: 'Step 2',
    badge: '₦300 Bonus',
    title: 'First Purchase',
    desc: 'Earn a bonus when your referral spends ₦1500 or more on their first order.',
  },
  {
    step: 'Step 3',
    badge: 'Activation',
    title: 'Commission Unlocked',
    desc: "When your referral's total spending hits ₦40,000, you unlock permanent network commissions.",
  },
  {
    step: 'Step 4',
    badge: 'Passive Income',
    title: 'Network Commissions',
    desc: 'Earn a percentage of every order made by your network for life.',
  },
];

export default function RewardsGuide() {
  const navigate = useNavigate();

  return (
    <ReferralLayout>
      <div className="mx-auto max-w-xl">
        {/* Back header (mobile) */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button onClick={() => navigate(-1)} className="text-primary">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-primary">Declan Foods</h1>
          <span className="w-6" />
        </div>

        {/* Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Share2 size={32} className="text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-primary">Rewards Guide</h2>
          <p className="mt-1 text-center text-sm text-ink-soft">
            Unlock multiple ways to earn while shopping premium agricultural produce
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-base font-bold text-primary">{s.step}</p>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  {s.badge}
                </span>
              </div>
              <p className="mt-3 text-base font-bold text-primary">{s.title}</p>
              <p className="mt-1 text-xs text-ink-soft">{s.desc}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-orange-300 bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="text-base font-bold text-orange-500">Bonus Benefit</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                1.5% Cashback
              </span>
            </div>
            <p className="mt-3 text-base font-bold text-orange-500">
              Personal Order Cashback
            </p>
            <p className="mt-1 text-xs text-orange-500/80">
              Get 1.5% back on your own orders once you hit a ₦40,000 personal monthly threshold.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/referrals')}
          className="mt-8 w-full rounded-full bg-primary py-4 text-base font-bold text-white hover:bg-primary-dark"
        >
          Start Referring
        </button>
      </div>
    </ReferralLayout>
  );
}