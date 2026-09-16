import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Star, Wallet, Info, Save } from 'lucide-react';

const levelDefaults = [
  { level: 'Level 1', pct: '5', note: 'Direct' },
  { level: 'Level 2', pct: '3', note: 'Tier 2' },
  { level: 'Level 3', pct: '1.5', note: 'Tier 3' },
  { level: 'Level 4', pct: '0.5', note: 'Tier 4' },
];

export default function CommissionCashbackSettings() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState(levelDefaults);
  const [unlockThreshold, setUnlockThreshold] = useState('50,000');
  const [minMonthlySpend, setMinMonthlySpend] = useState('10,000');
  const [cashbackOn, setCashbackOn] = useState(true);
  const [cashbackPct, setCashbackPct] = useState('2');
  const [cashbackMinSpend, setCashbackMinSpend] = useState('2,000');
  const [allowWalletUsage, setAllowWalletUsage] = useState(true);
  const [enableEarnings, setEnableEarnings] = useState(true);
  const [enableWithdrawals, setEnableWithdrawals] = useState(false);
  const [autoCredit, setAutoCredit] = useState(true);

  const updateLevel = (idx: number, pct: string) => {
    setLevels((prev) => prev.map((l, i) => (i === idx ? { ...l, pct } : l)));
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-primary-dark">Referral &amp; Rewards</h1>
        </div>
        <img
          src="https://i.pravatar.cc/60?img=5"
          alt="Admin"
          className="h-8 w-8 rounded-full object-cover"
        />
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
            {levels.map((l, idx) => (
              <div key={l.level} className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">{l.level}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <input
                    value={l.pct}
                    onChange={(e) => updateLevel(idx, e.target.value)}
                    inputMode="decimal"
                    className="w-12 bg-transparent text-2xl font-extrabold text-primary outline-none"
                  />
                  <span className="text-2xl font-extrabold text-primary">%</span>
                  <span className="ml-1 text-xs text-gray-400">{l.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Unlock Threshold</p>
          <div className="mt-2 flex items-center gap-1 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <span className="text-gray-500">₦</span>
            <input
              value={unlockThreshold}
              onChange={(e) => setUnlockThreshold(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">Min revenue to enable multilevel earnings.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Min Monthly Spend</p>
          <div className="mt-2 flex items-center gap-1 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <span className="text-gray-500">₦</span>
            <input
              value={minMonthlySpend}
              onChange={(e) => setMinMonthlySpend(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">Active status requirement per month.</p>
        </div>

        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                <Star size={14} />
              </span>
              <p className="text-sm font-bold text-gray-900">Cashback Rewards</p>
            </div>
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
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Percentage (%)
                </label>
                <input
                  value={cashbackPct}
                  onChange={(e) => setCashbackPct(e.target.value)}
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
                    onChange={(e) => setCashbackMinSpend(e.target.value)}
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
              Changes to commission levels and cashback percentages will only apply to new
              transactions. Existing pending settlements will follow previously active rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white"
        >
          <Save size={16} />
          Save Changes
        </button>
      </main>
    </div>
  );
}