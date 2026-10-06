import { X } from "lucide-react";
import { useState } from "react";

interface CancelModalProps {
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}

export function CancelOrderModal({ onConfirm, onClose, loading }: CancelModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Cancel Order?</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Are you sure you want to cancel this order? This cannot be undone.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tell us why you're cancelling (optional)"
          rows={3}
          className="mt-4 w-full resize-none rounded-2xl border border-gray-200 p-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

