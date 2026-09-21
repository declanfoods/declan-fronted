import { useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import type { DeliveryRider } from '../../app/lib/adminRiderApi';


type Props = {
  rider: DeliveryRider;
  loading: boolean;
  onConfirm: (note: string | null, estimatedDeliveryTime: string) => void;
  onClose: () => void;
};

export default function AssignRiderModal({ rider, loading, onConfirm, onClose }: Props) {
  const [note, setNote] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [errors, setErrors] = useState<{ time?: string }>({});

  const initials = rider.fullname
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?';

  function handleConfirm() {
    if (!estimatedDeliveryTime) {
      setErrors({ time: 'Set a delivery deadline for the rider.' });
      return;
    }
    setErrors({});
    onConfirm(note.trim() || null, new Date(estimatedDeliveryTime).toISOString());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl bg-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={
                rider.profilePictureUrl ||
                `https://i.pravatar.cc/80?u=${rider.id}`
              }
              alt={rider.fullname}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
            />
            <div>
              <p className="font-bold text-white">Assign {rider.fullname}</p>
              <p className="text-xs text-white/70">{rider.phoneNumberOne}</p>
            </div>
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

          {/* Rider deadline — mandatory */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Clock size={13} />
              Rider delivery deadline
              <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={estimatedDeliveryTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => {
                setEstimatedDeliveryTime(e.target.value);
                setErrors({});
              }}
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm
                         text-gray-800 focus:border-primary focus:outline-none
                         focus:ring-2 focus:ring-primary/20"
            />
            {errors.time && (
              <p className="text-xs text-red-500">{errors.time}</p>
            )}
            <p className="text-[11px] text-gray-400">
              Internal deadline — the window within which the rider must complete delivery.
            </p>
          </div>

          {/* Note — optional */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FileText size={13} />
              Note for rider
              <span className="text-gray-300 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Call customer before arriving, fragile items inside"
              className="w-full resize-none rounded-2xl border-2 border-gray-200 p-3 text-sm
                         text-gray-800 placeholder:text-gray-400 focus:border-primary
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
              {loading ? 'Assigning...' : 'Confirm Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}