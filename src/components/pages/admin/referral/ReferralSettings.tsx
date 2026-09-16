import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  UserPlus,
  ShoppingBag,
  Settings2,
  Save,
  Minus,
  Plus,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import {
  useReferralConfig,
  useUpdateReferralConfig,
} from '../../../../app/hooks/useAdminReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Referral Program Settings — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: 9 local useState values seeded with invented defaults (₦500 signup
| reward, ₦1000 bonus, ₦5000 min purchase, 30 days…). "Save Changes" was a
| plain <button> with no onClick — tapping it did nothing and gave no
| feedback either way.
|
| AFTER: values load from `GET /admin/config/referral` and
| "Save Changes" calls `PATCH /admin/config/referral` with a real request,
| real pending state, and a real success/error message.
|
| Field mapping (ReferralProgramConfig ⇄ form):
|   programEnabled          ⇄ Enable Referral Program
|   signupRewardEnabled     ⇄ Signup Reward toggle
|   signupRewardAmount      ⇄ Reward Amount (₦)
|   purchaseBonusEnabled    ⇄ Referral Purchase Bonus toggle
|   purchaseBonusAmount     ⇄ Bonus (₦)
|   purchaseBonusMinSpend   ⇄ Min Purchase (₦)
|   qualificationPeriodDays ⇄ Qualification Period (Days)
|
| ⛔ NOT PERSISTED — no backend field exists, so these two are now visibly
|    marked "Not saved" instead of pretending to work:
|      - Referral Code Format (USER+RANDOM / NAME+YEAR / GENERIC+UID)
|      - Link Expiry (Never / 6 Months)
*/

const CODE_FORMATS = ['USER+RANDOM', 'NAME+YEAR', 'GENERIC+UID'];
const LINK_EXPIRY_OPTIONS = ['Never', '6 Months'];
const QUALIFICATION_PERIODS = [15, 30, 60];

export default function ReferralSettings() {
  const navigate = useNavigate();

  const configQuery = useReferralConfig();
  const updateConfig = useUpdateReferralConfig();

  const config = configQuery.data;

  // ── Form state ────────────────────────────────────────────────────────
  const [enabled, setEnabled] = useState(true);
  const [signupRewardOn, setSignupRewardOn] = useState(true);
  const [signupAmount, setSignupAmount] = useState(0);
  const [purchaseBonusOn, setPurchaseBonusOn] = useState(true);
  const [bonus, setBonus] = useState('0');
  const [minPurchase, setMinPurchase] = useState('0');
  const [qualificationDays, setQualificationDays] = useState(30);

  // Local-only (backend has no field) — kept for UI completeness.
  const [codeFormat, setCodeFormat] = useState('USER+RANDOM');
  const [linkExpiry, setLinkExpiry] = useState('Never');

  // Hydrate the form the moment the config lands.
  useEffect(() => {
    if (!config) return;

    setEnabled(config.programEnabled);
    setSignupRewardOn(config.signupRewardEnabled);
    setSignupAmount(Number(config.signupRewardAmount ?? 0));
    setPurchaseBonusOn(config.purchaseBonusEnabled);
    setBonus(String(Number(config.purchaseBonusAmount ?? 0)));
    setMinPurchase(String(Number(config.purchaseBonusMinSpend ?? 0)));
    setQualificationDays(config.qualificationPeriodDays ?? 30);
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(
      {
        programEnabled: enabled,
        signupRewardEnabled: signupRewardOn,
        signupRewardAmount: Number(signupAmount ?? 0),
        purchaseBonusEnabled: purchaseBonusOn,
        purchaseBonusAmount: Number(bonus ?? 0),
        purchaseBonusMinSpend: Number(minPurchase ?? 0),
        qualificationPeriodDays: Number(qualificationDays ?? 30),
      },
      {
        onSuccess: () => window.alert('Referral program settings saved.'),
        onError: (error) =>
          window.alert(getApiErrorMessage(error, 'Could not save settings.')),
      }
    );
  };

  if (configQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-20 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (configQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-center text-sm text-gray-500">
          {getApiErrorMessage(configQuery.error, 'Could not load referral settings.')}
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
          <h2 className="text-2xl font-extrabold text-gray-900">Program Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage how rewards are calculated and issued to your members.
          </p>
        </div>

        {/* Global switch */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Enable Referral Program</p>
              <p className="text-xs text-gray-400">Global switch for system</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Signup reward */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-primary" />
              <p className="text-sm font-bold text-gray-900">Signup Reward</p>
            </div>
            <button
              type="button"
              onClick={() => setSignupRewardOn((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${
                signupRewardOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  signupRewardOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {signupRewardOn && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-gray-500">
                Reward Amount (₦)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSignupAmount((v) => Math.max(0, v - 50))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F7EE] text-gray-600"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-gray-800">
                  {signupAmount.toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => setSignupAmount((v) => v + 50)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F7EE] text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Purchase bonus */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              <p className="text-sm font-bold text-gray-900">Referral Purchase Bonus</p>
            </div>
            <button
              type="button"
              onClick={() => setPurchaseBonusOn((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${
                purchaseBonusOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  purchaseBonusOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {purchaseBonusOn && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">Bonus (₦)</label>
                  <input
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-gray-500">
                    Min Purchase (₦)
                  </label>
                  <input
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Qualification Period (Days)
                </label>
                <select
                  value={qualificationDays}
                  onChange={(e) => setQualificationDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none"
                >
                  {QUALIFICATION_PERIODS.map((d) => (
                    <option key={d} value={d}>
                      {d} Days
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Local-only settings */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Settings2 size={18} className="text-primary" />
            <p className="text-sm font-bold text-gray-900">Advanced Logic</p>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
              NOT SAVED
            </span>
          </div>

          <label className="mb-1.5 block text-xs text-gray-500">Referral Code Format</label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {CODE_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCodeFormat(f)}
                className={`rounded-full py-2.5 text-xs font-bold ${
                  codeFormat === f
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-xs text-gray-500">Link Expiry</label>
          <div className="grid grid-cols-2 gap-2">
            {LINK_EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLinkExpiry(opt)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  linkExpiry === opt
                    ? 'border-primary text-primary'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    linkExpiry === opt ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {linkExpiry === opt && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                {opt}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            These two are not backed by the API yet — they are UI-only and will not
            persist.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/referrals/settings/withdrawal')}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Landmark size={16} className="text-primary" />
            Withdrawal Settings
          </span>
          <span className="text-gray-300">→</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={16} />
          {updateConfig.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </main>

      <ReferralBottomNav />
    </div>
  );
}
