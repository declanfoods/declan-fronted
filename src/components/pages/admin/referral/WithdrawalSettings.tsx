import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  Landmark,
  Clock,
  ShieldCheck,
  Calendar,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  useUpdateWithdrawalConfig,
  useWithdrawalConfig,
} from '../../../../app/hooks/useAdminReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Withdrawal Settings — WIRED TO API
|--------------------------------------------------------------------------
| BEFORE: 6 local useState values with invented defaults ("2,000" minimum,
| "Mon-Fri, 9am-5pm" window, "24-48 hrs", auto-approval off) and a Save
| button with no onClick.
|
| AFTER: reads/writes GET|PATCH /admin/config/withdrawal.
|
| ⚠️ ONLY TWO FIELDS EXIST ON THE BACKEND:
|      withdrawalsEnabled   ⇄ Enable Withdrawals toggle
|      minWithdrawalAmount  ⇄ Min Withdrawal Amount
|
|   The other four controls (Withdrawal Window, Processing Time,
|   Auto Approval, Require Admin Approval) have NO backend column. They are
|   kept on screen but marked "NOT SAVED" and are excluded from the PATCH
|   payload, instead of silently pretending to persist.
*/

const PROCESSING_TIMES = ['12-24 hrs', '24-48 hrs', '48-72 hrs'];

export default function WithdrawalSettings() {
  const navigate = useNavigate();

  const configQuery = useWithdrawalConfig();
  const updateConfig = useUpdateWithdrawalConfig();

  const config = configQuery.data;

  const [enableWithdrawals, setEnableWithdrawals] = useState(false);
  const [minAmount, setMinAmount] = useState('0');

  // UI-only — no backend field.
  const [withdrawalWindow, setWithdrawalWindow] = useState('Mon-Fri, 9am-5pm');
  const [processingTime, setProcessingTime] = useState('24-48 hrs');
  const [autoApproval, setAutoApproval] = useState(false);
  const [requireAdminApproval, setRequireAdminApproval] = useState(true);

  useEffect(() => {
    if (!config) return;

    setEnableWithdrawals(Boolean(config.withdrawalsEnabled));
    setMinAmount(String(Number(config.minWithdrawalAmount ?? 0)));
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(
      {
        withdrawalsEnabled: enableWithdrawals,
        minWithdrawalAmount: Number(minAmount || 0),
      },
      {
        onSuccess: () => window.alert('Withdrawal settings saved.'),
        onError: (error) =>
          window.alert(getApiErrorMessage(error, 'Could not save withdrawal settings.')),
      }
    );
  };

  if (configQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (configQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-center text-sm text-gray-500">
          {getApiErrorMessage(configQuery.error, 'Could not load withdrawal settings.')}
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
          <h2 className="text-2xl font-extrabold text-primary">Withdrawal Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure disbursement limits and operational window for payouts.
          </p>
        </div>

        {/* SAVED */}
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
            <Wallet size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Enable Withdrawals</p>
            <p className="text-xs text-gray-400">Allow members to request payouts</p>
          </div>
          <button
            type="button"
            onClick={() => setEnableWithdrawals((v) => !v)}
            className={`h-6 w-11 shrink-0 rounded-full transition-colors ${
              enableWithdrawals ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                enableWithdrawals ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Landmark size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary">Financial Limits</h3>
          </div>
          <label className="mb-1.5 block text-sm text-gray-700">
            Min Withdrawal Amount
          </label>
          <div className="flex items-center gap-1 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <span className="text-gray-500">₦</span>
            <input
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
        </div>

        {/* NOT SAVED */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary">Processing Schedule</h3>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
              NOT SAVED
            </span>
          </div>

          <label className="mb-1.5 block text-sm text-gray-700">Withdrawal Window</label>
          <div className="flex items-center gap-2 rounded-xl bg-[#F3F7EE] px-4 py-3">
            <Calendar size={16} className="text-gray-400" />
            <input
              value={withdrawalWindow}
              onChange={(e) => setWithdrawalWindow(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
            />
          </div>

          <label className="mb-1.5 mt-4 block text-sm text-gray-700">Processing Time</label>
          <select
            value={processingTime}
            onChange={(e) => setProcessingTime(e.target.value)}
            className="w-full rounded-xl bg-[#F3F7EE] px-4 py-3 text-sm font-semibold text-gray-800 outline-none"
          >
            {PROCESSING_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary">Governance &amp; Approvals</h3>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
              NOT SAVED
            </span>
          </div>

          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Auto Approval</p>
              <p className="text-xs text-gray-400">
                Instant disbursement for low-risk amounts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoApproval((v) => !v)}
              className={`h-6 w-11 shrink-0 rounded-full transition-colors ${
                autoApproval ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  autoApproval ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Require Admin Approval</p>
              <p className="text-xs text-gray-400">Manual review for all transactions</p>
            </div>
            <button
              type="button"
              onClick={() => setRequireAdminApproval((v) => !v)}
              className={`h-6 w-11 shrink-0 rounded-full transition-colors ${
                requireAdminApproval ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  requireAdminApproval ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            These four controls are not backed by the API yet — only the toggle and
            minimum amount above are saved.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={16} />
          {updateConfig.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </main>
    </div>
  );
}
