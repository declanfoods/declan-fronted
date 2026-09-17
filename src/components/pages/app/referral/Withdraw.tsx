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
  MailCheck,
  XCircle,
} from 'lucide-react';
import ReferralLayout from './ReferralLayout';
import {
  useReferralWallet,
  useInitiateWithdrawal,
  useVerifyWithdrawal,
  useResendWithdrawalCode,
  useCancelWithdrawal,
  useWithdrawalRequests,
} from '../../../../app/hooks/useReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import { bankOf, type PayoutRequest } from '../../../../app/lib/referralApi';

/*
|--------------------------------------------------------------------------
| Withdraw Funds — LIVE (wired to the real endpoints)
|--------------------------------------------------------------------------
| The backend has shipped the whole "Referrals > Withdrawal Request" folder,
| so this screen is no longer speculative. It's a TWO-STEP flow:
|
|   STEP 1 — form
|     amount → bank → account number → account name
|     POST /referrals/withdrawals/requests/initiate
|     Response: { id, verificationStatus: 'UNVERIFIED', requestStatus: 'PENDING' }
|     and the message "Check email for verification code".
|
|   STEP 2 — verification code
|     The customer types the 6-digit code from their email.
|     PATCH /referrals/withdrawals/requests/:id/verify  { verificationCode }
|     On success verificationStatus → 'VERIFIED', requestStatus stays 'PENDING'.
|     The request now sits in the admin payout queue for approval.
|
|   STEP 3 — done
|
| Also wired:
|   • "Resend code"  → POST .../:id/request-verification  (does NOT create a
|     second request — it re-sends for the existing one)
|   • "Cancel"       → PATCH .../:id/cancel-request
|
| ⚠️ The 404 "not live yet" branch from the previous version is gone. It was
| correct when the endpoint didn't exist; leaving it in now would be dead code.
|
| ⚠️ Status is TWO fields, not one:
|     verificationStatus: UNVERIFIED | VERIFIED
|     requestStatus:      PENDING | CANCELLED | APPROVED | REJECTED
|   A request is routinely VERIFIED *and* PENDING at the same time — that's
|   the normal "waiting for admin approval" state, not a bug.
|
| ⚠️ `amount` arrives as a string ("500.00") on reads and a number on the
|   initiate response, so every read goes through Number().
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

type Step = 'form' | 'verify' | 'done';

/** Turns 'PENDING' → 'Pending', 'NOT QUALIFIED' → 'Not Qualified'. */
function titleCase(value?: string) {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REJECTED: 'bg-red-50 text-red-600',
};

export default function Withdraw() {
  const navigate = useNavigate();

  const walletQuery = useReferralWallet();
  const requestsQuery = useWithdrawalRequests();

  const initiate = useInitiateWithdrawal();
  const verify = useVerifyWithdrawal();
  const resendCode = useResendWithdrawalCode();
  const cancelRequest = useCancelWithdrawal();

  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [request, setRequest] = useState<PayoutRequest | null>(null);
  const [codeSentTo, setCodeSentTo] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const available = Number(walletQuery.data?.availableBalance ?? 0);
  const pending = Number(walletQuery.data?.pendingBalance ?? 0);
  const lifetime = Number(walletQuery.data?.lifetimeEarned ?? 0);

  const bankName = bank === 'Other' ? customBank.trim() : bank;
  const numericAmount = Number(amount);

  const previousRequests = requestsQuery.data?.payoutRequests ?? [];

  /*
    If the customer already started a request and never entered the code, we
    surface that instead of letting them create a duplicate. Initiate on the
    backend creates a NEW request every time, so this guard is the difference
    between one payout and three.
  */
  const unfinished = previousRequests.find(
    (r) => r.verificationStatus === 'UNVERIFIED' && r.requestStatus === 'PENDING'
  );

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
  };

  const setQuickAmount = (pct: number) => {
    const value = Math.floor(available * pct);
    setAmount(String(value));
    setTouched((t) => ({ ...t, amount: true }));
  };

  // ── STEP 1 — initiate ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Mark everything touched so all errors surface at once.
    setTouched({ amount: true, bank: true, accountNumber: true, accountName: true });

    if (!isValid) return;

    try {
      const res = await initiate.mutateAsync({
        // Number, not string — matches the collection's example body.
        amount: numericAmount,
        accountName: accountName.trim(),
        accountNumber,
        bankName,
      });

      const created = res.data.data?.payoutRequest ?? null;
      setRequest(created);
      setCode('');
      setCodeError('');
      setStep('verify');
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Could not submit your withdrawal request.')
      );
    }
  };

  // ── STEP 2 — verify ───────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (!request?.id) {
      setCodeError('This request is missing its ID. Please start again.');
      return;
    }

    if (code.trim().length < 4) {
      setCodeError('Enter the verification code from your email.');
      return;
    }

    try {
      const res = await verify.mutateAsync({
        id: request.id,
        verificationCode: code.trim(),
      });

      setRequest(res.data.data?.payoutRequest ?? request);
      setStep('done');
    } catch (error) {
      setCodeError(
        getApiErrorMessage(error, 'That code was not accepted. Check it and try again.')
      );
    }
  };

  const handleResend = async () => {
    if (!request?.id) return;
    setCodeError('');

    try {
      await resendCode.mutateAsync(request.id);
      setCodeSentTo('sent');
      setTimeout(() => setCodeSentTo(''), 4000);
    } catch (error) {
      setCodeError(getApiErrorMessage(error, 'Could not resend the code.'));
    }
  };

  const handleCancel = async () => {
    if (!request?.id) {
      setStep('form');
      setRequest(null);
      return;
    }

    if (!window.confirm('Cancel this withdrawal request? The money stays in your wallet.')) {
      return;
    }

    try {
      await cancelRequest.mutateAsync(request.id);
      setRequest(null);
      setStep('form');
      setAmount('');
      setCode('');
    } catch (error) {
      setCodeError(getApiErrorMessage(error, 'Could not cancel this request.'));
    }
  };

  /** Jump back into an unfinished request found in the history. */
  const resumeUnfinished = () => {
    if (!unfinished) return;
    const bankBlock = bankOf(unfinished);
    setRequest(unfinished);
    setAccountName(bankBlock?.accountName ?? '');
    setAccountNumber(bankBlock?.accountNumber ?? '');
    setAmount(String(Number(unfinished.amount ?? 0)));
    setCode('');
    setCodeError('');
    setStep('verify');
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

  /* ── STEP 3 — done ─────────────────────────────────────────────────── */
  if (step === 'done' && request) {
    const bankBlock = bankOf(request);
    const verified = request.verificationStatus === 'VERIFIED';
    const reference = request.id ? request.id.slice(0, 8).toUpperCase() : '—';

    return (
      <ReferralLayout>
        <div className="mx-auto max-w-md py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={34} className="text-primary" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-primary">
            {verified ? 'Request Verified' : 'Request Submitted'}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {verified
              ? "You're all set. An admin will review and pay out your request shortly."
              : 'Your request was created. Enter the code we emailed you to finish.'}
          </p>

          <div className="mt-6 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100">
            <p className="text-center text-3xl font-extrabold text-primary">
              ₦{Number(request.amount ?? numericAmount).toLocaleString()}
            </p>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <Row label="Bank" value={bankBlock?.bankName ?? bankName} />
              <Row label="Account Number" value={bankBlock?.accountNumber ?? accountNumber} />
              <Row label="Account Name" value={bankBlock?.accountName ?? accountName} />
              <Row
                label="Verification"
                value={titleCase(request.verificationStatus)}
                valueClass={
                  verified ? 'font-bold text-green-600' : 'font-bold text-amber-600'
                }
              />
              {/*
                Shown as-is. VERIFIED + PENDING is the normal "waiting for
                admin approval" state — not a contradiction.
              */}
              <Row
                label="Status"
                value={titleCase(request.requestStatus)}
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

  /* ── STEP 2 — verification code ────────────────────────────────────── */
  if (step === 'verify') {
    return (
      <ReferralLayout>
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <button
              onClick={() => setStep('form')}
              className="text-primary"
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-base font-bold text-primary">Verify Withdrawal</h1>
            <span className="w-6" />
          </div>

          <div className="mb-5 rounded-2xl bg-primary p-5 text-white">
            <div className="flex items-center gap-2">
              <MailCheck size={18} />
              <p className="text-sm">Check your email</p>
            </div>
            <p className="mt-2 text-sm text-white/80">
              We sent a verification code to the email on your account. Enter it below to
              finish your ₦{Number(request?.amount ?? numericAmount).toLocaleString()}{' '}
              withdrawal.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-semibold text-primary">
                Verification Code
              </label>

              <div
                className={`flex items-center rounded-xl border bg-white px-4 py-3 transition-colors ${
                  codeError ? 'border-red-400' : 'border-gray-300 focus-within:border-primary'
                }`}
              >
                <Hash size={18} className="mr-2 shrink-0 text-primary" />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                    setCodeError('');
                  }}
                  placeholder="6-digit code"
                  className="w-full bg-transparent text-lg tracking-[0.4em] text-ink outline-none"
                />
              </div>

              {codeError && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{codeError}</p>
              )}
            </div>

            {codeSentTo === 'sent' && (
              <div className="flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
                <p className="text-xs font-semibold text-green-700">
                  A new code is on its way. Check your spam folder too.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={verify.isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-white transition-opacity hover:bg-primary-dark disabled:opacity-50"
            >
              {verify.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying…
                </>
              ) : (
                'Verify & Submit'
              )}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCode.isPending}
                className="font-semibold text-primary disabled:opacity-50"
              >
                {resendCode.isPending ? 'Sending…' : 'Resend code'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelRequest.isPending}
                className="font-semibold text-gray-400 disabled:opacity-50"
              >
                Cancel request
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-ink-soft">
              <Info size={13} /> The code goes to the email on your account.
            </p>
          </form>
        </div>
      </ReferralLayout>
    );
  }

  /* ── STEP 1 — the form ─────────────────────────────────────────────── */
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

        {/* A previously started request that never got verified. */}
        {unfinished && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                You have an unfinished request
              </p>
              <p className="mt-1 text-xs text-amber-800">
                ₦{Number(unfinished.amount ?? 0).toLocaleString()} is waiting on a
                verification code. Finish it instead of starting a new one.
              </p>
              <button
                type="button"
                onClick={resumeUnfinished}
                className="mt-2 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white"
              >
                Finish that request
              </button>
            </div>
          </div>
        )}

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
            <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-primary">
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

          {/* What happens next */}
          <div className="flex gap-3 rounded-2xl bg-primary/10 p-4">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">What happens next</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-primary/80">
                <li>You submit this request.</li>
                <li>We email you a verification code — enter it to confirm.</li>
                <li>An admin reviews it, then your bank is paid within 2–3 days.</li>
              </ol>
            </div>
          </div>

          {/* Server error */}
          {submitError && (
            <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-xs font-semibold text-red-600">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={initiate.isPending || available <= 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-white transition-opacity hover:bg-primary-dark disabled:opacity-50"
          >
            {initiate.isPending ? (
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

        {/* Request history */}
        {previousRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-bold text-primary">Your Requests</h2>

            <div className="space-y-2">
              {previousRequests.map((r) => {
                const bankBlock = bankOf(r);
                const cancellable = r.requestStatus === 'PENDING';
                const tone = STATUS_TONE[r.requestStatus] ?? 'bg-gray-100 text-gray-500';

                return (
                  <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-ink">
                          ₦{Number(r.amount ?? 0).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {bankBlock?.bankName ?? '—'} ·{' '}
                          {bankBlock?.accountNumber
                            ? `••••${bankBlock.accountNumber.slice(-4)}`
                            : '—'}
                        </p>
                      </div>

                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tone}`}>
                        {titleCase(r.requestStatus)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
                      <span>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString('en-NG', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>

                      {cancellable && (
                        <button
                          type="button"
                          onClick={() => {
                            setRequest(r);
                            handleCancel();
                          }}
                          disabled={cancelRequest.isPending}
                          className="flex items-center gap-1 font-semibold text-red-500 disabled:opacity-50"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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