import { useState, useEffect } from 'react';
import { Download, Eye, Wallet, History, Search } from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import SplashLoader from '../../../ui/SplashLoader';
import { userApi } from '../../../../app/lib/userApi';
import { referralApi, type ReferralPerson } from '../../../../app/lib/referralApi';

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

export default function ReferralList() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('John');
  const [referrals, setReferrals] = useState<ReferralPerson[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, refRes, listRes] = await Promise.allSettled([
          userApi.getProfileOverview(),
          userApi.getReferralsOverview(),
          referralApi.getReferrals(),
        ]);
        if (profileRes.status === 'fulfilled')
          setFirstName(profileRes.value.data.data?.user?.profile?.firstName ?? 'John');
        if (refRes.status === 'fulfilled') {
          const m = refRes.value.data.data.metrics;
          setTotalReferrals(m?.totalDirectReferrals ?? 0);
          setActiveReferrals(m?.totalActiveReferrals ?? 0);
          setReferrals(m?.referrals ?? []);
        }
        if (listRes.status === 'fulfilled') {
          const list = listRes.value.data.data?.referrals ?? [];
          if (list.length > 0) setReferrals(list);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = referrals
  .filter((r) => r && (r.firstName || r.lastName))  // ← skip null/empty
  .filter((r) => {
    const q = query.toLowerCase();
    return (
      !q ||
      (r.firstName ?? '').toLowerCase().includes(q) ||
      (r.lastName ?? '').toLowerCase().includes(q)
    );
  });

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
            <h3 className="text-lg font-bold text-ink">Direct Referrals</h3>
            <button className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">
                No referrals yet.
              </p>
            ) : (
              filtered.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {r.numberOfDeliveredOrders} Orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ₦{Number(r.totalAmountOfDeliveredOrders).toLocaleString()}
                    </p>
                    <p className="text-xs text-primary line-through">
                      ₦{Number(r.totalAmountOfDeliveredOrders).toLocaleString()} spent
                    </p>
                  </div>
                  <button className="text-primary">
                    <Eye size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
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
          <p className="mt-2 text-3xl font-bold">₦25,000</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary">
              💸 Withdraw
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 py-2.5 text-sm font-semibold text-white">
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
              No referrals yet.
            </p>
          ) : (
            filtered.map((r, i) => (
              <MobileReferralCard key={i} referral={r} />
            ))
          )}
        </div>
      </div>
    </ReferralLayout>
  );
}

function MobileReferralCard({ referral }: { referral: ReferralPerson }) {
  const firstName = referral.firstName ?? '';
  const lastName = referral.lastName ?? '';
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';

  const progress = Math.min(100, (referral.numberOfDeliveredOrders / 10) * 100);
  const isQualified = progress >= 100;
  const isActive = referral.numberOfDeliveredOrders > 0 && !isQualified;
  const status = isQualified ? 'Qualified' : isActive ? 'Active' : 'Pending';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-primary">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-ink-soft">
              Joined {formatDate(referral.dateJoined)}
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
              : `Progression: ₦${Number(referral.totalAmountOfDeliveredOrders ?? 0).toLocaleString()}/₦40,000`}
          </span>
          <span className="font-bold text-primary">{Math.round(progress)}%</span>
        </div>
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
          <p className="font-bold text-primary">{referral.numberOfDeliveredOrders ?? 0}</p>
        </div>
        <div className="text-right">
          <p className="text-ink-soft">Total Rewards</p>
          <p className="font-bold text-primary">
            ₦{Number(referral.totalAmountOfDeliveredOrders ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
