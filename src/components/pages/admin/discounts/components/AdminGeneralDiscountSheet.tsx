import { useState } from "react";
import { adminGeneralDiscountApi, type GeneralDiscount } from "../../../../../app/lib/adminGeneralDiscountApi";
import { AlertTriangle, Tag, ToggleLeft, ToggleRight, X } from "lucide-react";



interface DiscountFormState {
  title:                   string;
  percentOff:              string;
  expiresAt:               string;  // <input type="datetime-local"> value
  overrideProductDiscount: boolean;
}

const emptyForm = (): DiscountFormState => ({
  title:                   '',
  percentOff:              '',
  expiresAt:               '',
  overrideProductDiscount: false,
});

export function AdminDiscountSheet({
  editing,
  onClose,
  onSaved,
}: {
  editing:  GeneralDiscount | null;  // null = create mode
  onClose:  () => void;
  onSaved:  (discount: GeneralDiscount) => void;
}) {
  const isEdit = editing !== null;

  const [form, setForm] = useState<DiscountFormState>(() => {
    if (!editing) return emptyForm();
    // Pre-fill for edit — datetime-local needs "YYYY-MM-DDTHH:mm"
    const dt = new Date(editing.expiresAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    const localDt =
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
      `T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

    return {
      title:                   editing.title,
      percentOff:              String(editing.percentageOff),
      expiresAt:               localDt,
      overrideProductDiscount: editing.overrideProductDiscount,
    };
  });

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = <K extends keyof DiscountFormState>(k: K, v: DiscountFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim())  return setError('Title is required.');
    if (!form.percentOff)    return setError('Percentage is required.');
    if (!form.expiresAt)     return setError('Expiry date is required.');

    const pct = Number(form.percentOff);
    if (Number.isNaN(pct) || pct < 0 || pct > 100)
      return setError('Percentage must be between 0 and 100.');

    if (new Date(form.expiresAt).getTime() <= Date.now())
      return setError('Expiry date must be in the future.');

    setSaving(true);
    setError('');

    try {
      let saved: GeneralDiscount;
      if (isEdit) {
        const res = await adminGeneralDiscountApi.updateDiscount(editing.id, {
          title:                   form.title,
          percentOff:              pct,
          expiresAt:               new Date(form.expiresAt),
          overrideProductDiscount: form.overrideProductDiscount,
        });
        saved = res.data.data.discount;
      } else {
        const res = await adminGeneralDiscountApi.createDiscount({
          title:                   form.title,
          percentOff:              pct,
          expiresAt:               new Date(form.expiresAt),
          overrideProductDiscount: form.overrideProductDiscount,
        });
        saved = res.data.data.discount;
      }
      onSaved(saved);
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
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Discount' : 'New General Discount'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Discount Title
            </label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Christmas Sale, Eid Special"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
            />
          </div>

          {/* Percentage */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Percentage Off (%)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-primary">
              <input
                value={form.percentOff}
                onChange={(e) => set('percentOff', e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="e.g. 10"
                className="flex-1 bg-transparent text-sm font-semibold text-gray-800 outline-none"
              />
              <span className="text-sm font-bold text-primary">%</span>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
            />
          </div>

          {/* Override toggle */}
          <button
            type="button"
            onClick={() => set('overrideProductDiscount', !form.overrideProductDiscount)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3.5"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Override Product Discounts</p>
              <p className="mt-0.5 text-xs text-gray-400">
                When on, this discount replaces any individual product discount
              </p>
            </div>
            {form.overrideProductDiscount ? (
              <ToggleRight size={26} className="shrink-0 text-primary" />
            ) : (
              <ToggleLeft size={26} className="shrink-0 text-gray-300" />
            )}
          </button>

          {/* Preview pill */}
          {form.percentOff && Number(form.percentOff) > 0 && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary/5 py-3">
              <Tag size={14} className="text-primary" />
              <p className="text-sm font-bold text-primary">
                {Number(form.percentOff)}% off all products
                {form.overrideProductDiscount ? ' (overrides product discounts)' : ''}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving
              ? isEdit ? 'Saving…' : 'Creating…'
              : isEdit ? 'Save Changes' : 'Create Discount'}
          </button>
        </div>
      </div>
    </div>
  );
}