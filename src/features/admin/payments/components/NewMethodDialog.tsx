import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import type { CreatePaymentMethodPayload } from '../api';

export default function NewMethodDialog({
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (payload: CreatePaymentMethodPayload) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  /*
    Defaults to on. An admin adding a method usually wants it usable, and the
    create body requires isActive — there is no "server default" to defer to.
  */
  const [isActive, setIsActive] = useState(true);

  const trimmedTitle = title.trim();
  const canSubmit = trimmedTitle.length >= 2 && description.trim().length > 0 && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={busy ? undefined : onCancel} aria-hidden />

      <div role="dialog" aria-modal="true" aria-labelledby="new-payment-method" className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="new-payment-method" className="text-lg font-bold text-gray-900">New Payment Method</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) {
              onSubmit({ title: trimmedTitle, description: description.trim(), isActive });
            }
          }}
        >
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cash on Delivery"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
          />

          <label className="mb-1.5 mt-4 block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Pay with cash when your order arrives"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Shown to the customer under the method name at checkout.
          </p>

          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-left"
          >
            <span
              className={
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ' +
                (isActive ? 'border-primary bg-primary' : 'border-gray-300')
              }
            >
              {isActive && <Check size={13} className="text-white" strokeWidth={3} />}
            </span>
            <span className="flex-1 text-sm text-gray-700">
              Live at checkout straight away
            </span>
          </button>

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? 'Saving...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
