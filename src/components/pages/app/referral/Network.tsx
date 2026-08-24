import { useState, useEffect } from 'react';
import { Download, Share2, Wallet, User } from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import SplashLoader from '../../../ui/SplashLoader';
import { userApi } from '../../../../app/lib/userApi';
import { type ReferralPerson } from '../../../../app/lib/referralApi';

export default function ReferralNetwork() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('John');
  const [referrals, setReferrals] = useState<ReferralPerson[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);

  useEffect(() => {
    userApi.getReferralsOverview().then((res) => {
      const m = res.data.data.metrics;
      setTotalReferrals(m?.totalDirectReferrals ?? 0);
      setActiveReferrals(m?.totalActiveReferrals ?? 0);
      setReferrals(m?.referrals ?? []);
    }).finally(() => setLoading(false));

    userApi.getProfileOverview().then((res) => {
      setFirstName(res.data.data?.user?.profile?.firstName ?? 'John');
    }).catch(() => {});
  }, []);

  if (loading) {
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
        totalReferrals={totalReferrals}
        activeReferrals={activeReferrals}
        totalEarnings="80,000"
        thisMonth="80,000"
        pending="80,000"
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
                {totalReferrals} Total Members
              </span>
              <button className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50">
                <Download size={16} /> Export Tree
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border-2 border-primary p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl text-primary">−</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  Y
                </div>
                <span className="text-sm font-bold text-ink">You</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">₦29,500</p>
                <p className="text-xs text-ink-soft">Level 1</p>
              </div>
            </div>

            <div className="ml-8 space-y-2 border-l-2 border-primary/30 pl-4">
              {referrals.slice(0, 6).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-primary">−</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                     {(r.firstName?.[0] ?? '?')}
{(r.lastName?.[0] ?? '')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-ink-soft">1.5% commission</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      ₦{Number(r.totalAmountOfDeliveredOrders).toLocaleString()}
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
          <p className="mt-2 text-3xl font-bold">₦25,000</p>
          <p className="mt-1 text-xs text-white/80">Lifetime Earnings</p>
          <p className="text-sm font-semibold">₦25,000</p>
          <button className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">
            💸 Withdraw
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-primary">Total Network</p>
            <p className="mt-1 text-2xl font-bold text-primary">128</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-primary">Qualified</p>
            <p className="mt-1 text-2xl font-bold text-primary">100</p>
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
            <div className="h-6 w-0.5 bg-gray-300" />
            <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white">
              L1: 1.5%
            </span>
            <div className="h-6 w-0.5 bg-gray-300" />
            <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold text-ink">
              L2: 0.75%
            </span>
            <div className="h-6 w-0.5 bg-gray-300" />
            <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold text-ink">
              L3: 0.375%
            </span>
          </div>
        </div>

        {/* Network Performance */}
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Network Performance</p>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            {['Level 1 (Direct)', 'Level 2', 'Level 3'].map((label) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{label}</span>
                  <span className="font-bold text-primary">₦29,500</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-primary" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Network */}
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Your Network</p>
          <div className="space-y-3">
            {referrals.slice(0, 3).map((r, i) => {
              const isPending = r.numberOfDeliveredOrders === 0;
              return (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {r.firstName[0]}
                        {r.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {r.firstName} {r.lastName}
                        </p>
                        <p className="text-xs text-ink-soft">
                          Joined{' '}
                          {new Date(r.dateJoined).toLocaleDateString('en-NG', {
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
                        ? 'Awaiting first purchase (₦0/₦40,000)'
                        : `Progression: ₦${Number(r.totalAmountOfDeliveredOrders).toLocaleString()}/₦40,000`}
                    </p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (Number(r.totalAmountOfDeliveredOrders) / 40000) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-xs">
                    <div>
                      <p className="text-ink-soft">Orders</p>
                      <p className="font-bold text-primary">{r.numberOfDeliveredOrders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ink-soft">
                        {isPending ? 'Potential Rewards' : 'Total Rewards'}
                      </p>
                      <p className="font-bold text-primary">₦40,000</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full text-center text-sm font-semibold text-primary">
            See More
          </button>
        </div>
      </div>
    </ReferralLayout>
  );
}
