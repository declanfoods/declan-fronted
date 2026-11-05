import { useState } from "react";
import { useUpdateWalletBalance } from "../../app/hooks/useAdminUsers";
import type { AdminUpdateWalletBalanceRequest } from "../../app/lib/adminUserApi";
import { getApiErrorMessage } from "../../app/lib/api-types";
import { TrendingDown, TrendingUp } from "lucide-react";


  function formatNaira(value: string | number | undefined) {
    return `₦${Number(value ?? 0).toLocaleString()}`;
  }

interface WalletUpdateModalProps {
  userId: string;
  currentBalance: string | undefined;
  onClose: () => void;
  onSuccess: () => void
}

export function WalletUpdateModal({ userId, currentBalance, onClose, onSuccess }: WalletUpdateModalProps) {
  const [operation, setOperation] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const updateWallet = useUpdateWalletBalance();

  const parsedAmount = Number(amount.replace(/,/g, ''));
  const isValid = parsedAmount > 0 && reason.trim().length > 0;

  const handleSubmit = () => {
  if (!isValid) return;

  const body: AdminUpdateWalletBalanceRequest = {
    amount: parsedAmount,
    operation,
    reason: reason.trim(),
  };

  updateWallet.mutate(
    { userId, body },
    {
      onSuccess: () => {
        onSuccess(); // triggers refetch in parent
        onClose();
      },
      onError: (error) =>
        window.alert(getApiErrorMessage(error, 'Could not update wallet balance.')),
    }
  );
};

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sheet */}
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Update Referral Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current balance */}
        <div className="mb-5 rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="mt-0.5 text-2xl font-extrabold text-gray-900">
            {formatNaira(currentBalance)}
          </p>
        </div>

        {/* Operation toggle */}
        <div className="mb-4 flex rounded-xl border border-gray-200 p-1">
          {(['CREDIT', 'DEBIT'] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setOperation(op)}
              className={
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors ' +
                (operation === op
                  ? op === 'CREDIT'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700')
              }
            >
              {op === 'CREDIT' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {op === 'CREDIT' ? 'Credit' : 'Debit'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              ₦
            </span>
            <input
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Manual adjustment for campaign reward"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Preview */}
        {parsedAmount > 0 && (
          <div
            className={
              'mb-4 rounded-xl px-4 py-3 text-sm font-medium ' +
              (operation === 'CREDIT'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600')
            }
          >
            {operation === 'CREDIT' ? '+ ' : '– '}
            {formatNaira(parsedAmount)} will be{' '}
            {operation === 'CREDIT' ? 'added to' : 'deducted from'} this wallet.
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || updateWallet.isPending}
          className={
            'w-full rounded-full py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ' +
            (operation === 'CREDIT' ? 'bg-primary' : 'bg-red-500')
          }
        >
          {updateWallet.isPending
            ? 'Updating…'
            : `Confirm ${operation === 'CREDIT' ? 'Credit' : 'Debit'}`}
        </button>
      </div>
    </div>
  );
}