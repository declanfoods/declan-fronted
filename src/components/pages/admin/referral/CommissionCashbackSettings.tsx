import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Wallet, Info, Save, RefreshCw } from 'lucide-react';
import {
  useCommissionConfig,
  useUpdateCashbackConfig,
  useUpdateCommissionConfig,
  useUpdateWalletConfig,
} from '../../../../app/hooks/useAdminReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Commission & Cashback & Wallet — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: 4 commission levels with invented defaults (5% / 3% / 1.5% / 0.5%),
| an unlock threshold of "50,000", cashback 2% on "2,000", and a Save button
| with no onClick.
|
| AFTER: reads GET /admin/config/commission (which returns all three blocks
| in one payload: { commission, cashback, wallet }) and writes through three
| separate PATCH endpoints.
|
| ⚠️ IMPORTANT MISMATCH — the UI showed FOUR commission levels.
|    The backend only stores TWO:
|        levelOneCommissionRate
|        levelTwoCommissionRate
|    So the Level 3 / Level 4 cards have been removed rather than displayed
|    as decorative inputs that can never be saved. If you need L3/L4, the
|    config table + PATCH DTO need new columns.
|
| Field mapping:
|   commission.levelOneCommissionRate  ⇄ Level 1 %
|   commission.levelTwoCommissionRate  ⇄ Level 2 %
|   commission.unlockThreshold         ⇄ Unlock Threshold
|   commission.minimumMonthlySpend     ⇄ Min Monthly Spend
|   cashback.enabled / percentage / minimumSpend
|   wallet.allowWalletUsage / enableEarnings / enableWithdrawals / autoCreditCashback
|
| Note: numeric fields arrive as `string | number` depending on the row, so
| everything is normalised through Number()/String() before going into inputs.
*/

export default function CommissionCashbackSettings() {
  const navigate = useNavigate();

  const configQuery = useCommissionConfig();
  const updateCommission = useUpdateCommissionConfig();
  const updateCashback = useUpdateCashbackConfig();
  const updateWallet = useUpdateWalletConfig();

  const config = configQuery.data;

  const [levelOne, setLevelOne] = useState('0');
  const [levelTwo, setLevelTwo] = useState('0');
  const [unlockThreshold, setUnlockThreshold] = useState('0');
  const [minMonthlySpend, setMinMonthlySpend] = useState('0');

  const [cashbackOn, setCashbackOn] = useState(false);
  const [cashbackPct, setCashbackPct] = useState('0');
  const [cashbackMinSpend, setCashbackMinSpend] = useState('0');

  const [allowWalletUsage, setAllowWalletUsage] = useState(false);
  const [enableEarnings, setEnableEarnings] = useState(false);
  const [enableWithdrawals, setEnableWithdrawals] = useState(false);
  const [autoCredit, setAutoCredit] = useState(false);

  useEffect(() => {
    if (!config) return;

    setLevelOne(String(Number(config.commission?.levelOneCommissionRate ?? 0)));
    setLevelTwo(String(Number(config.commission?.levelTwoCommissionRate ?? 0)));
    setUnlockThreshold(String(Number(config.commission?.unlockThreshold ?? 0)));
    setMinMonthlySpend(String(Number(config.commission?.minimumMonthlySpend ?? 0)));

    setCashbackOn(Boolean(config.cashback?.enabled));
    setCashbackPct(String(Number(config.cashback?.percentage ?? 0)));
    setCashbackMinSpend(String(Number(config.cashback?.minimumSpend ?? 0)));

    setAllowWalletUsage(Boolean(config.wallet?.allowWalletUsage));
    setEnableEarnings(Boolean(config.wallet?.enableEarnings));
    setEnableWithdrawals(Boolean(config.wallet?.enableWithdrawals));
    setAutoCredit(Boolean(config.wallet?.autoCreditCashback));
  }, [config]);

  const isSaving =
    updateCommission.isPending || updateCashback.isPending || updateWallet.isPending;

  const handleSave = async () => {
    try {
      // Three separate endpoints — run them together and report the first failure.
      await Promise.all([
        updateCommission.mutateAsync({
          levelOneCommissionRate: Number(levelOne || 0),
          levelTwoCommissionRate: Number(levelTwo || 0),
          unlockThreshold: Number(unlockThreshold || 0),
          minimumMonthlySpend: Number(minMonthlySpend || 0),
        }),
        updateCashback.mutateAsync({
          enabled: cashbackOn,
          percentage: Number(cashbackPct || 0),
          minimumSpend: Number(cashbackMinSpend || 0),
        }),
        updateWallet.mutateAsync({
          allowWalletUsage,
          enableEarnings,
          enableWithdrawals,
          autoCreditCashback: autoCredit,
        }),
      ]);

      window.alert('Commission, cashback and wallet settings saved.');
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Could not save all settings.'));
    }
  };

  const toggles = [
    {
      label: 'Allow Wallet Usage',
      desc: 'Enable users to pay for orders via wallet.',
      value: allowWalletUsage,
      set: setAllowWalletUsage,
    },
    {
      label: 'Enable Earnings',
      desc: 'Allow commissions to be credited to user wallets.',
      value: enableEarnings,
      set: setEnableEarnings,
    },
    {
      label: 'Enable Withdrawals',
      desc: 'Allow users to withdraw wallet funds to bank accounts.',
      value: enableWithdrawals,
      set: setEnableWithdrawals,
    },
    {
      label: 'Auto-Credit Cashback',
      desc: 'Instantly credit cashback after order confirmation.',
      value: autoCredit,
      set: setAutoCredit,
    },
  ];

  if (configQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (configQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-center text-sm text-gray-500">
          {getApiErrorMessage(configQuery.error, 'Could not load system rules.')}
        </p>
        <button
          type="button"
          onClick={() => configQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div>
          <p className="text-sm text-gray-500">System Rules</p>
          <h2 className="text-xl font-extrabold text-primary">Commission &amp; Cashback</h2>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <GitBranch size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-gray-900">Multi-Level Commission</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">Level 1</p>
              <div className="mt-1 flex items-baseline gap-1">
                <input
                  value={levelOne}
                  onChange={(e) => setLevelOne(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  className="w-14 bg-transparent text-2xl font-extrabold text-primary outline-none"
                />
                <span className="text-2xl font-extrabold text-primary">%</span>
                <span className="ml-1 text-xs text-gray-400">Direct</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">Level 2</p>
              <div className="mt-1 flex items-baseline gap-1">
                <input
                  value={levelTwo}
                  onChange={(e) => setLevelTwo(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  className="w-14 bg-transparent text-2xl font-extrabold text-primary outline-none"
                />
                <span className="text-2xl font-extrabold text-primary">%</span>
                <span className="ml-1 text-xs text-gray-400">Tier 2</span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            The backend currently stores two commission levels. Levels 3 and 4 were
            removed from this screen because there is nowhere to save them.
          </p>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Unlock Threshold</p>
          <div className="mt-2 flex items-center gap-1 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <span className="text-gray-500">₦</span>
            <input
              value={unlockThreshold}
              onChange={(e) => setUnlockThreshold(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Min revenue to enable multilevel earnings.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Min Monthly Spend</p>
          <div className="mt-2 flex items-center gap-1 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <span className="text-gray-500">₦</span>
            <input
              value={minMonthlySpend}
              onChange={(e) => setMinMonthlySpend(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Spend required each month to stay commission-eligible.
          </p>
        </div>

        {/* Cashback */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Cashback</p>
            <button
              type="button"
              onClick={() => setCashbackOn((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${
                cashbackOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  cashbackOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {cashbackOn && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Percentage (%)
                </label>
                <input
                  value={cashbackPct}
                  onChange={(e) => setCashbackPct(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Min Spend (₦)
                </label>
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <span className="text-gray-500">₦</span>
                  <input
                    value={cashbackMinSpend}
                    onChange={(e) =>
                      setCashbackMinSpend(e.target.value.replace(/[^\d.]/g, ''))
                    }
                    className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-gray-900">Wallet Management</h3>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {toggles.map((t) => (
              <div key={t.label} className="flex items-center gap-3 px-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => t.set((v: boolean) => !v)}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors ${
                    t.value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                      t.value ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 rounded-2xl bg-[#EDEFE6] p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-gray-500" />
          <div>
            <p className="text-sm font-bold text-gray-900">Rule Processing Note</p>
            <p className="mt-1 text-xs text-gray-600">
              Changes to commission levels and cashback percentages will only apply to
              new transactions. Existing pending settlements will follow previously
              active rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={16} />
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </main>
    </div>
  );
}
