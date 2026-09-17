import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Landmark,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  User,
  Hash,
  History,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import ReferralBottomNav from '../../../admin/ReferralBottomNav';
import {
  useAdminPayoutRequest,
  useApprovePayout,
  useRejectPayout,
} from '../../../../app/hooks/useAdminReferrals';
import { getApiErrorMessage } from '../../../../app/lib/api-types';

/*
|--------------------------------------------------------------------------
| Admin → Referral Payout → Request Details  —  LIVE
|--------------------------------------------------------------------------
| Was mock data (`mockPayoutDetails[id]`, which only had key "p1") with inert
| Approve/Reject buttons and a "Demo data — awaiting API" banner. The backend
| now ships the real endpoints, so every action here is live:
|
|   GET   /admin/referrals/withdrawal-requests/:id
|   PATCH /admin/referrals/withdrawal-requests/:id/approve   (no body)
|   PATCH /admin/referrals/withdrawal-requests/:id/reject    ({ reason })
|
| WHY THE CONTEXT PANEL MATTERS
|   The detail response is the only place that carries:
|     wallet { referralWalletBalance, cashbackWalletBalance }
|     previousWithdrawals [{ amount, status }]
|   An approver needs both to judge a request — a ₦50,000 ask against a ₦2,000
|   balance is a different decision from the same ask against ₦80,000. That is
|   why this screen exists separately from the queue.
|
| REJECT requires a reason. It is mandatory in the API and it is what the
| customer is shown, so the modal will not submit an empty one.
|
| ⚠️ `amount` is a STRING ("2000.00") — always through Number().
*/

function naira(value: string | number | undefined) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function titleCase(value?: string) {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-rose-100 text-rose-600',
  APPROVED: 'bg-primary/10 text-primary',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function initialsOf(name?: string) {
  return (
    (name ?? '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function fullDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PayoutRequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const detailQuery = useAdminPayoutRequest(id);
  const approve = useApprovePayout();
  const reject = useRejectPayout();

  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  // Account number goes to a banking app, so it has to be copyable.
  const [copiedAccount, setCopiedAccount] = useState(false);

  /*
    Copies the payout account number. Falls back to a hidden textarea +
    document.execCommand when the async Clipboard API isn't available — it
    needs a secure context, and admins do open this over plain http on
    internal networks, where navigator.clipboard is simply undefined.
  */
  const copyAccountNumber = async () => {
    const value = account?.accountNumber;
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 1500);
    } catch {
      // Permission denied — the number is still on screen to read.
    }
  };

  const detail = detailQuery.data;
  const isPending = detail?.requestStatus === 'PENDING';
  const busy = approve.isPending || reject.isPending;

  // ── Loading ───────────────────────────────────────────────────────────
  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F3F7EE] px-5 pt-6">
        <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────
  if (detailQuery.isError || !detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-center text-sm text-gray-500">
          {detailQuery.isError
            ? getApiErrorMessage(detailQuery.error, 'Could not load this payout request.')
            : 'Payout request not found.'}
        </p>
        <p className="text-center text-xs text-gray-400">
          Request:{' '}
          <span className="font-mono">
            GET /admin/referrals/withdrawal-requests/{id}
          </span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => detailQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700"
          >
            <RefreshCw size={14} /> Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/referrals/queue')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  const account = detail.accountDetails;
  const tone = STATUS_TONE[detail.requestStatus] ?? 'bg-gray-100 text-gray-500';
  const wallet = detail.wallet;
  const walletBalance = Number(wallet?.referralWalletBalance ?? 0);
  const cashbackBalance = Number(wallet?.cashbackWalletBalance ?? 0);
  const requestAmount = Number(detail.amount ?? 0);

  // Does the request exceed what the wallet actually holds? Flagging this is
  // the single most useful thing this screen does for an approver.
  const exceedsWallet = walletBalance > 0 && requestAmount > walletBalance;

  // ── Actions ───────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setActionError('');

    if (!id) return;
    if (!window.confirm(`Approve ${naira(requestAmount)} to ${detail.user?.fullname}?`)) {
      return;
    }

    try {
      await approve.mutateAsync(id);
      setDone('approved');
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Could not approve this payout.'));
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    if (!id) return;

    if (reason.trim().length < 3) {
      setActionError('Give a reason — the customer sees this.');
      return;
    }

    try {
      await reject.mutateAsync({ id, reason: reason.trim() });
      setShowReject(false);
      setDone('rejected');
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Could not reject this payout.'));
    }
  };

  // ── Outcome screen ────────────────────────────────────────────────────
  if (done) {
    const approved = done === 'approved';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            approved ? 'bg-primary/10' : 'bg-red-50'
          }`}
        >
          {approved ? (
            <CheckCircle2 size={34} className="text-primary" />
          ) : (
            <XCircle size={34} className="text-red-500" />
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          {approved ? 'Payout Approved' : 'Payout Rejected'}
        </h1>
        <p className="max-w-sm text-center text-sm text-gray-500">
          {approved
            ? `${detail.user?.fullname ?? 'The member'} has been approved for ${naira(
                requestAmount
              )}.`
            : `The request from ${detail.user?.fullname ?? 'the member'} was rejected and they have been told why.`}
        </p>

        <button
          type="button"
          onClick={() => navigate('/admin/referrals/queue')}
          className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-28">
      <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Payout Details</h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pt-5">
        {/* Hero */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {detail.user?.profilePictureUrl ? (
              <img
                src={detail.user.profilePictureUrl}
                alt={detail.user.fullname}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {initialsOf(detail.user?.fullname)}
              </span>
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {detail.user?.fullname ?? 'Unknown member'}
              </p>
              <p className="text-xs text-gray-400">
                {detail.user?.id ? `ID: ${detail.user.id.slice(0, 8)}` : 'ID: —'}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone}`}>
              {titleCase(detail.requestStatus)}
            </span>
          </div>

          <p className="mt-4 text-center text-3xl font-extrabold text-primary">
            {naira(requestAmount)}
          </p>
          <p className="mt-1 text-center text-xs text-gray-400">
            Requested {fullDate(detail.createdAt)}
          </p>
        </div>

        {/* Excess warning — the most useful thing for an approver */}
        {exceedsWallet && isPending && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Request exceeds the wallet balance
              </p>
              <p className="mt-1 text-xs text-amber-800">
                They are asking for {naira(requestAmount)} but hold{' '}
                {naira(walletBalance)}. Review carefully before approving.
              </p>
            </div>
          </div>
        )}

        {/* Bank account */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">
            PAYOUT ACCOUNT
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Landmark size={16} className="shrink-0 text-primary" />
              <span className="text-gray-500">Bank</span>
              <span className="ml-auto font-semibold text-gray-900">
                {account?.bankName ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Hash size={16} className="shrink-0 text-primary" />
              <span className="text-gray-500">Account No.</span>
              <span className="ml-auto flex min-w-0 items-center gap-2">
                <span className="truncate font-mono font-semibold text-gray-900">
                  {account?.accountNumber ?? '—'}
                </span>
                {account?.accountNumber && (
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    aria-label={
                      copiedAccount
                        ? 'Account number copied'
                        : `Copy account number ${account.accountNumber}`
                    }
                    title={copiedAccount ? 'Copied!' : 'Copy account number'}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:border-primary hover:text-primary"
                  >
                    {copiedAccount ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="shrink-0 text-primary" />
              <span className="text-gray-500">Account Name</span>
              <span className="ml-auto max-w-[55%] truncate text-right font-semibold text-gray-900">
                {account?.accountName ?? '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Wallet context */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Wallet size={14} className="text-primary" />
            <p className="text-xs font-semibold tracking-wide text-gray-400">
              THEIR WALLET
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-[#F3F7EE] py-3">
              <p className="text-lg font-extrabold text-gray-900">{naira(walletBalance)}</p>
              <p className="text-[10px] text-gray-400">REFERRAL</p>
            </div>
            <div className="rounded-xl bg-[#F3F7EE] py-3">
              <p className="text-lg font-extrabold text-gray-900">
                {naira(cashbackBalance)}
              </p>
              <p className="text-[10px] text-gray-400">CASHBACK</p>
            </div>
          </div>
        </section>

        {/* Previous withdrawals */}
        {detail.previousWithdrawals?.length > 0 && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <History size={14} className="text-primary" />
              <p className="text-xs font-semibold tracking-wide text-gray-400">
                PREVIOUS WITHDRAWALS
              </p>
            </div>

            <div className="space-y-2">
              {detail.previousWithdrawals.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-[#F3F7EE] px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-gray-900">{naira(w.amount)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      STATUS_TONE[w.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {titleCase(w.status)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timestamps */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">
            TIMELINE
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Requested</span>
              <span className="font-medium text-gray-900">
                {fullDate(detail.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Verified</span>
              <span className="font-medium text-gray-900">
                {detail.verifiedAt ? fullDate(detail.verifiedAt) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Approved</span>
              <span className="font-medium text-gray-900">
                {detail.approvedAt ? fullDate(detail.approvedAt) : '—'}
              </span>
            </div>
          </div>
          {/*
            The API returns verifiedAt/approvedAt as null even on a request it
            reports as VERIFIED. Noted here so nobody "fixes" the UI around it.
          */}
          <p className="mt-2 text-[11px] text-gray-400">
            Timestamps can lag behind the status badges — the API sometimes returns
            them as null right after a change.
          </p>
        </section>

        {actionError && (
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs font-semibold text-red-600">{actionError}</p>
          </div>
        )}

        {/* Reject form */}
        {showReject && (
          <form onSubmit={handleReject} className="rounded-2xl bg-white p-4 shadow-sm">
            <label htmlFor="reason" className="mb-2 block text-sm font-semibold text-gray-900">
              Why are you rejecting this?
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Account name does not match the account number"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              The customer is shown this reason.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReject(false);
                  setReason('');
                  setActionError('');
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600"
              >
                Keep it pending
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reject.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Rejecting…
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Sticky actions — only while the request is still actionable */}
      {isPending && !showReject && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4">
          <div className="mx-auto flex max-w-md gap-3">
            <button
              type="button"
              onClick={() => {
                setShowReject(true);
                setActionError('');
              }}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 py-3.5 text-sm font-bold text-red-500 disabled:opacity-50"
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {approve.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Approving…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Approve
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Once actioned, no actions — just a way back. */}
      {!isPending && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={() => navigate('/admin/referrals/queue')}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white"
            >
              Back to Queue
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
              This request is {titleCase(detail.requestStatus).toLowerCase()} — no further
              action needed.
            </p>
          </div>
        </div>
      )}

      <ReferralBottomNav />
    </div>
  );
}