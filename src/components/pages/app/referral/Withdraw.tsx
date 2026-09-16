import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Landmark,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Hash,
  User,
  Loader2,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import {
  useReferralWallet,
  useRequestWithdrawal,
} from '../../../../app/hooks/useReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import type { WithdrawalRequestResult } from '../../../../app/lib/referralApi';

/*
|--------------------------------------------------------------------------
| Withdraw Funds — FULLY DESIGNED
|--------------------------------------------------------------------------
| What the user does here:
|   1. Enter the amount
|   2. Pick / enter the bank
|   3. Enter the account number (10-digit NUBAN)
|   4. Enter the account name
|   5. Request the withdrawal
|
| EVERYTHING on this screen is real except the POST itself, which the backend
| hasn't built yet. The form validates properly (amount vs balance, NUBAN
| length, required fields), shows inline field errors, has a pending state, and
| on a successful response shows a confirmation receipt.
|
| Because `POST /referrals/withdraw` currently 404s, the submit path detects
| that specific status and shows an explicit "not live yet" notice — it never
| fakes a success screen. The moment the backend adds the route, this screen
| works with zero frontend changes.
*/

const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTB)',
  'Heritage Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Moniepoint MFB',
  'Opay',
  'Palmpay',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank',
  'Other',
];

interface FieldErrors {
  amount?: string;
  bank?: string;
  accountNumber?: string;
  accountName?: string;
}

export default function Withdraw() {
  const navigate = useNavigate();

  const walletQuery = useReferralWallet();
  const withdrawal = useRequestWithdrawal();

  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState('');
  const [notLive, setNotLive] = useState(false);
  const [receipt, setReceipt] = useState<WithdrawalRequestResult | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const available = Number(walletQuery.data?.availableBalance ?? 0);
  const pending = Number(walletQuery.data?.pendingBalance ?? 0);
  const lifetime = Number(walletQuery.data?.lifetimeEarned ?? 0);

  const bankName = bank === 'Other' ? customBank.trim() : bank;
  const numericAmount = Number(amount);

  // ── Validation ────────────────────────────────────────────────────────
  const errors: FieldErrors = useMemo(() => {
    const e: FieldErrors = {};

    if (!amount.trim()) {
      e.amount = 'Enter an amount to withdraw.';
    } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      e.amount = 'Enter a valid amount greater than zero.';
    } else if (numericAmount > available) {
      e.amount = `You can withdraw up to ₦${available.toLocaleString()}.`;
    }

    if (!bankName) e.bank = 'Select your bank.';

    if (!accountNumber) {
      e.accountNumber = 'Enter your 10-digit account number.';
    } else if (accountNumber.length !== 10) {
      e.accountNumber = 'Account number must be exactly 10 digits.';
    }

    if (!accountName.trim()) {
      e.accountName = 'Enter the account name.';
    } else if (accountName.trim().length < 3) {
      e.accountName = 'Account name looks too short.';
    }

    return e;
  }, [amount, numericAmount, available, bankName, accountNumber, accountName]);

  const isValid = Object.keys(errors).length === 0;

  const show = (field: keyof FieldErrors) => touched[field] && errors[field];

  const handleAmountChange = (raw: string) => {
    // digits + one decimal point only
    const cleaned = raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    setAmount(cleaned);
    setSubmitError('');
    setNotLive(false);
  };

  const setQuickAmount = (pct: number) => {
    const value = Math.floor(available * pct);
    setAmount(String(value));
    setTouched((t) => ({ ...t, amount: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setNotLive(false);

    // Mark everything touched so all errors surface at once.
    setTouched({ amount: true, bank: true, accountNumber: true, accountName: true });

    if (!isValid) return;

    try {
      const res = await withdrawal.mutateAsync({
        amount: numericAmount,
        bankName,
        accountNumber,
        accountName: accountName.trim(),
      });

      setReceipt(res.data.data ?? null);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      // 404 = route not implemented yet. Say so honestly.
      if (status === 404) {
        setNotLive(true);
      } else {
        setSubmitError(
          getApiErrorMessage(error, 'Could not submit your withdrawal request.')
        );
      }
    }
  };

  const copyReference = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1500);
    } catch {
      // clipboard blocked
    }
  };

  // ── Success receipt ───────────────────────────────────────────────────
  if (receipt) {
    const reference = receipt.id ? receipt.id.slice(0, 8).toUpperCase() : '—';

    return (
      <ReferralLayout>
        <div className="mx-auto max-w-md py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={34} className="text-primary" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-primary">Request Submitted</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Your withdrawal request is being reviewed. You'll be notified once it's
            processed.
          </p>

          <div className="mt-6 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100">
            <p className="text-center text-3xl font-extrabold text-primary">
              ₦{Number(receipt.amount ?? numericAmount).toLocaleString()}
            </p>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <Row label="Bank" value={receipt.bankName ?? bankName} />
              <Row label="Account Number" value={receipt.accountNumber ?? accountNumber} />
              <Row label="Account Name" value={receipt.accountName ?? accountName} />
              <Row
                label="Status"
                value={receipt.status ?? 'PENDING'}
                valueClass="font-bold text-amber-600"
              />
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Reference</span>
                <button
                  type="button"
                  onClick={() => copyReference(reference)}
                  className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary"
                >
                  {reference}
                  {copiedRef ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/referrals')}
            className="mt-6 w-full rounded-full bg-primary py-4 text-base font-bold text-white"
          >
            Back to Referrals
          </button>
        </div>
      </ReferralLayout>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <ReferralLayout>
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button onClick={() => navigate(-1)} className="text-primary" aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-primary">Withdraw Funds</h1>
          <span className="w-6" />
        </div>

        <h1 className="mb-6 hidden text-2xl font-bold text-primary md:block">
          Withdraw Funds
        </h1>

        {/* Balance card */}
        <div className="mb-5 rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            <p className="text-sm">Available for Withdrawal</p>
          </div>

          <p className="mt-2 text-3xl font-bold">
            {walletQuery.isLoading ? '—' : `₦${available.toLocaleString()}`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/20 pt-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Pending: ₦{pending.toLocaleString()}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Lifetime: ₦{lifetime.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Amount to Withdraw
            </label>

            <div
              className={`flex items-center rounded-xl border bg-white px-4 py-3 transition-colors ${
                show('amount') ? 'border-red-400' : 'border-gray-300 focus-within:border-primary'
              }`}
            >
              <span className="mr-2 text-lg font-bold text-primary">₦</span>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                placeholder="0"
                className="flex-1 bg-transparent text-lg font-semibold text-ink outline-none"
              />
            </div>

            {show('amount') ? (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.amount}</p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-soft">
                Maximum ₦{available.toLocaleString()}
              </p>
            )}

            {/* Quick amounts */}
            {available > 0 && (
              <div className="mt-2 flex gap-2">
                {[0.25, 0.5, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setQuickAmount(pct)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {pct === 1 ? 'Withdraw All' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bank */}
          <div>
            <label htmlFor="bank" className="mb-2 block text-sm font-semibold text-primary">
              Bank Name
            </label>

            <div
              className={`flex items-center rounded-xl border bg-white px-4 py-3 transition-colors ${
                show('bank') ? 'border-red-400' : 'border-gray-300 focus-within:border-primary'
              }`}
            >
              <Landmark size={18} className="mr-2 shrink-0 text-primary" />
              <select
                id="bank"
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  setTouched((t) => ({ ...t, bank: true }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, bank: true }))}
                className="w-full bg-transparent text-sm text-ink outline-none"
              >
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Free-text fallback when "Other" is picked */}
            {bank === 'Other' && (
              <input
                type="text"
                value={customBank}
                onChange={(e) => setCustomBank(e.target.value)}
                placeholder="Type your bank name"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary"
              />
            )}

            {show('bank') && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.bank}</p>
            )}
          </div>

          {/* Account number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Account Number
            </label>

            <div
              className={`flex items-center rounded-xl border bg-white px-4 py-3 transition-colors ${
                show('accountNumber')
                  ? 'border-red-400'
                  : 'border-gray-300 focus-within:border-primary'
              }`}
            >
              <Hash size={18} className="mr-2 shrink-0 text-primary" />
              <input
                id="accountNumber"
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setSubmitError('');
                }}
                onBlur={() => setTouched((t) => ({ ...t, accountNumber: true }))}
                placeholder="10-digit NUBAN"
                className="w-full bg-transparent text-sm tracking-widest text-ink outline-none"
              />
              <span className="ml-2 shrink-0 text-xs text-ink-soft">
                {accountNumber.length}/10
              </span>
            </div>

            {show('accountNumber') && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* Account name */}
          <div>
            <label
              htmlFor="accountName"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Account Name
            </label>

            <div
              className={`flex items-center rounded-xl border bg-white px-4 py-3 transition-colors ${
                show('accountName')
                  ? 'border-red-400'
                  : 'border-gray-300 focus-within:border-primary'
              }`}
            >
              <User size={18} className="mr-2 shrink-0 text-primary" />
              <input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setSubmitError('');
                }}
                onBlur={() => setTouched((t) => ({ ...t, accountName: true }))}
                placeholder="Name on the account"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>

            {show('accountName') ? (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.accountName}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-soft">
                Must match the name registered to this account number.
              </p>
            )}
          </div>

          {/* Summary */}
          {isValid && (
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary">Review</p>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">You receive</span>
                  <span className="font-bold text-primary">
                    ₦{numericAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">To</span>
                  <span className="max-w-[60%] truncate text-right font-semibold text-ink">
                    {accountName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Bank</span>
                  <span className="max-w-[60%] truncate text-right font-semibold text-ink">
                    {bankName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Processing note */}
          <div className="flex gap-3 rounded-2xl bg-primary/10 p-4">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">Processing Time</p>
              <p className="mt-1 text-xs text-primary/80">
                Requests are reviewed by an admin, then paid out within 2–3 business
                days depending on your bank.
              </p>
            </div>
          </div>

          {/* Not-live notice (backend 404) */}
          {notLive && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Withdrawals aren't live yet
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Your details are valid, but the payout endpoint hasn't been built on
                  the backend, so nothing was submitted and no money has moved.
                </p>
              </div>
            </div>
          )}

          {/* Server error */}
          {submitError && (
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-xs font-semibold text-red-600">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={withdrawal.isPending || available <= 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-white transition-opacity hover:bg-primary-dark disabled:opacity-50"
          >
            {withdrawal.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting…
              </>
            ) : (
              'Request Withdrawal'
            )}
          </button>

          {available <= 0 && !walletQuery.isLoading && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
              <Info size={13} /> You have no available balance to withdraw.
            </p>
          )}

          <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-ink-soft">
            <ShieldCheck size={13} /> Your bank details are only used to pay you.
          </p>
        </form>
      </div>
    </ReferralLayout>
  );
}

function Row({
  label,
  value,
  valueClass = 'font-semibold text-ink',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className={`max-w-[60%] truncate text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
