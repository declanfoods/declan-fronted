import { useState } from "react";
import { adminGeneralDiscountApi, type GeneralDiscount } from "../../../../../app/lib/adminGeneralDiscountApi";
import { AlertTriangle } from "lucide-react";

export function AdminDiscountToggleActiveSheet({
  discount,
  onClose,
  onToggled,
}: {
  discount:  GeneralDiscount;
  onClose:   () => void;
  onToggled: (updated: GeneralDiscount) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const turningOn  = !discount.isActive;
  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await adminGeneralDiscountApi.updateDiscount(discount.id, {
        isActive: turningOn,
      });
      onToggled(res.data.data.discount);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full rounded-t-3xl bg-white pb-10">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 py-4">
          <p className="text-base font-bold text-gray-900">
            {turningOn ? 'Activate Discount?' : 'Deactivate Discount?'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {turningOn
              ? `"${discount.title}" will become the active general discount. Any other active discount must be deactivated first.`
              : `"${discount.title}" will stop applying to all products.`}
          </p>
        </div>

        <div className="space-y-3 px-5">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleConfirm}
            className={`w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60 ${
              turningOn ? 'bg-primary' : 'bg-red-500'
            }`}
          >
            {saving
              ? 'Updating…'
              : turningOn ? 'Yes, Activate' : 'Yes, Deactivate'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-gray-100 py-3.5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}