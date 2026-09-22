import { useState } from 'react';
import { Wallet, Calendar, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReferralLayout from './ReferralLayout';
import DesktopShell from './DesktopShell';
import {
  deriveFirstName,
  useCustomerProfile,
  useReferralCode,
  useReferralHistory,
  useReferralMetrics,
  useReferralWallet,
} from '../../../../app/hooks/useReferrals';

/*
|--------------------------------------------------------------------------
| Referral Earnings — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: `MOCK_HISTORY` (4 invented months, every row "₦3050 = ₦1850 +
| ₦1200"), `MOCK_CHART` (6 invented bar heights), a hardcoded "₦14,500 Total
| Lifetime Earnings", a "₦25,000" wallet, and a "Recent History" list built
| from `Array.from({ length: 7 })` — seven identical fake rows all saying
| "Referral: Chidi Okoro".
|
| AFTER:
|   Wallet + lifetime  ← referralApi.getWallet()   → availableBalance / pendingBalance / lifetimeEarned
|   Ledger rows        ← referralApi.getHistory()  → paginated { title, description, amount, createdAt }
|   Monthly chart      ← derived by grouping the ledger by month
|   Total earned       ← sum of the ledger
|
| The "Last 6 Months / View All" controls and the "Use on orders" button
| remain inert (no endpoint) — flagged in the report.
*/

const formatNaira = (value: string | number | undefined) =>
  `₦${Number(value ?? 0).toLocaleString()}`;

export default function ReferralEarnings() {
  const navigate = useNavigate();
  const [page] = useState(1);

  const codeQuery = useReferralCode();
  const profileQuery = useCustomerProfile();
  const walletQuery = useReferralWallet();
  const metricsQuery = useReferralMetrics();
  const historyQuery = useReferralHistory({ page, limit: 50 });

  const firstName = deriveFirstName({ profileOverview: profileQuery.data, referralCode: codeQuery.data });
  const wallet = walletQuery.data;
  const metrics = metricsQuery.data;
  const history = historyQuery.data?.history ?? [];

  // Group the ledger by month for the chart — replaces MOCK_CHART.
  const monthly = history.reduce<Record<string, number>>((acc, item) => {
    const key = new Date(item.createdAt).toLocaleDateString('en-NG', {
      month: 'short',
    });
    acc[key] = (acc[key] ?? 0) + Math.abs(Number(item.amount ?? 0));
    return acc;
  }, {});

  const chart = Object.entries(monthly)
    .slice(0, 6)
    .map(([month, value]) => ({ month, value }));

  const maxChart = Math.max(1, ...chart.map((c) => c.value));

  const totalEarned = history.reduce(
    (sum, item) => sum + Math.abs(Number(item.amount ?? 0)),
    0
  );

  if (codeQuery.isLoading || walletQuery.isLoading) {
    return (
      <ReferralLayout>
        <div className="py-16 text-center text-sm text-ink-soft">Loading…</div>
      </ReferralLayout>
    );
  }

  return (
    <ReferralLayout>
      {/* ═══ DESKTOP VIEW ═══ */}
      <DesktopShell
        firstName={firstName}
        totalReferrals={metrics?.totalNetwork ?? 0}
        activeReferrals={metrics?.qualifiedCount ?? 0}
        totalEarnings={Number(wallet?.lifetimeEarned ?? 0).toLocaleString()}
        thisMonth={Number(wallet?.availableBalance ?? 0).toLocaleString()}
        pending={Number(wallet?.pendingBalance ?? 0).toLocaleString()}
      >
        {/* Referral wallet */}
        <section className="rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">
            Referral Wallet -{' '}
            <span className="text-primary">
              {formatNaira(wallet?.availableBalance)}
            </span>
          </h3>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/app/checkout')}
              className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-ink"
            >
              Use on orders
            </button>
            <button
              onClick={() => navigate('/app/referrals/withdraw')}
              className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-ink"
            >
              Request Payment
            </button>
          </div>
        </section>

        {/* Earning history */}
        <section className="mt-6 rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Earning History</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Monthly breakdown of your referral income
          </p>

          {historyQuery.isError && (
            <div className="mt-5 text-center">
              <p className="text-sm text-ink-soft">Could not load your earnings.</p>
              <button
                onClick={() => historyQuery.refetch()}
                className="mt-3 text-sm font-semibold text-primary"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {!historyQuery.isLoading && history.length === 0 && !historyQuery.isError && (
              <p className="py-6 text-center text-sm text-ink-soft">
                No earnings yet.
              </p>
            )}

            {history.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-2xl border border-primary/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{row.title}</p>
                    <p className="text-xs text-ink-soft">{row.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {formatNaira(row.amount)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {new Date(row.createdAt).toLocaleDateString('en-NG', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {history.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-lg font-bold text-primary">Total Lifetime Earnings</p>
                <p className="text-lg font-bold text-primary">
                  {formatNaira(wallet?.lifetimeEarned ?? totalEarned)}
                </p>
              </div>
            )}
          </div>
        </section>
      </DesktopShell>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden space-y-4">
        {/* Wallet */}
        <div className="rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {formatNaira(wallet?.availableBalance)}
          </p>
          <p className="mt-1 text-xs text-white/80">Lifetime Earnings</p>
          <p className="text-sm font-semibold">{formatNaira(wallet?.lifetimeEarned)}</p>
          <button
            onClick={() => navigate('/app/referrals/withdraw')}
            className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary"
          >
            💸 Withdraw
          </button>
        </div>

        {/* Chart — built from the real ledger */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Earning Trends</p>
            <span className="text-xs font-semibold text-primary">By month</span>
          </div>

          {chart.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-soft">No data yet.</p>
          ) : (
            <div className="mt-4 flex h-32 items-end justify-between gap-2">
              {chart.map((bar) => (
                <div key={bar.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${(bar.value / maxChart) * 100}%` }}
                  />
                  <span className="text-[10px] text-ink-soft">{bar.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent History */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Recent History</p>
          </div>

          {history.length === 0 ? (
            <p className="rounded-2xl bg-primary/10 p-4 text-center text-xs text-ink-soft">
              Nothing here yet.
            </p>
          ) : (
            <div className="space-y-2 rounded-2xl bg-primary/10 p-3">
              {history.slice(0, 7).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Coins size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-primary">
                      {new Date(item.createdAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      +{formatNaira(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReferralLayout>
  );
}
