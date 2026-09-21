import { useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';

type Props = {
  onConfirm: (note: string, estimatedDeliveryTime: string) => void;
  onClose: () => void;
  loading: boolean;
};

export default function MarkOrderProcessingModal({ onConfirm, onClose, loading }: Props) {
  const [note, setNote] = useState('We have now packed your order');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [errors, setErrors] = useState<{ time?: string }>({});

  function handleConfirm() {
    if (!estimatedDeliveryTime) {
      setErrors({ time: 'Please set an estimated delivery time.' });
      return;
    }
    setErrors({});
    onConfirm(note, estimatedDeliveryTime);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl bg-primary px-5 py-4">
          <div>
            <p className="font-bold text-white">Mark as Processing</p>
            <p className="text-xs text-white/70">This will notify the customer</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FileText size={13} /> Note to customer
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. We have now packed your order"
              className="w-full resize-none rounded-2xl border-2 border-gray-200 p-3 text-sm
                         text-gray-800 placeholder:text-gray-400 focus:border-primary
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Estimated delivery time */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Clock size={13} /> Estimated delivery time
            </label>
            <input
              type="datetime-local"
              value={estimatedDeliveryTime}
              onChange={(e) => {
                setEstimatedDeliveryTime(e.target.value);
                setErrors({});
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm
                         text-gray-800 focus:border-primary focus:outline-none
                         focus:ring-2 focus:ring-primary/20"
            />
            {errors.time && (
              <p className="text-xs text-red-500">{errors.time}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border-2 border-gray-200 py-3 text-sm
                         font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold
                         text-white disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}