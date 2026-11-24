import { XCircle } from 'lucide-react';
import type { PayoutRequest } from '../api';
import { bankOf, payoutStatusLabel, payoutStatusTone } from '../payout';

interface WithdrawalHistoryProps {
  requests: PayoutRequest[];
  onCancel: (request: PayoutRequest) => void;
  cancelling: boolean;
}

export default function WithdrawalHistory({ requests, onCancel, cancelling }: WithdrawalHistoryProps) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-bold text-primary">Your Requests</h2>

      <div className="space-y-2">
        {requests.map((r) => {
          const bankBlock = bankOf(r);
          const cancellable = r.requestStatus === 'PENDING';
          const tone = payoutStatusTone(r.requestStatus);

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
                  {payoutStatusLabel(r.requestStatus)}
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
                    onClick={() => onCancel(r)}
                    disabled={cancelling}
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
  );
}
