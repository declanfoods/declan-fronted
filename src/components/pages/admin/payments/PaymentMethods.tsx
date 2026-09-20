import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Loader2,
  RefreshCw,
  X,
  Check,
  Info,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import {
  useAdminPaymentMethods,
  useCreatePaymentMethod,
  useTogglePaymentMethod,
} from '../../../../app/hooks/useAdminPayments';

/*
|==========================================================================
| ADMIN → PAYMENTS   /admin/payments
|==========================================================================
|
| Manages the payment methods a customer can choose at checkout.
|
|   GET    /api/v1/admin/payments/payment-methods
|   POST   /api/v1/admin/payments/payment-methods   { title, description, isActive }
|   PATCH  /api/v1/admin/payments/payment-methods/:id/activate
|   PATCH  /api/v1/admin/payments/payment-methods/:id/deactivate
|
| Why this is new: all four endpoints were sitting unused in the collection.
| They have no saved responses, which is why they were skipped before — but
| the customer-side twin (GET /api/v1/payment-method) reads live and
| unauthenticated, and returns exactly:
|
|   { id, title, description }
|
| so the admin list is the same objects plus `isActive`. All of that reasoning
| and the defensive normaliser live in app/lib/adminPaymentApi.ts.
|
| ── WHAT A CUSTOMER SEES ─────────────────────────────────────────────────
| Only ACTIVE methods surface at checkout, so switching one off here is what
| removes it from the customer's options. The screen says so, because an admin
| switching off "Cash on Delivery" should know it disappears from checkout
| rather than merely being flagged.
|
| ── WHY THE TOGGLE IS OPTIMISTIC ─────────────────────────────────────────
| The activate/deactivate responses are undocumented, so nothing is read back
| from them. The switch flips instantly, and `useTogglePaymentMethod` rolls it
| back if the call fails and re-syncs either way. See the hook.
*/

export default function PaymentMethods() {
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  /* Writing which id is mid-flight, so only that row shows a spinner. */
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const methodsQuery = useAdminPaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const toggleMethod = useTogglePaymentMethod();

  const methods = methodsQuery.data ?? [];
  const activeCount = methods.filter((m) => m.isActive).length;

  const handleToggle = async (id: string, nextActive: boolean) => {
    setActionError('');
    setTogglingId(id);

    try {
      await toggleMethod.mutateAsync({ id, active: nextActive });
    } catch (err) {
      /*
        The optimistic flip is rolled back by the hook's onError, so this only
        has to explain what happened.
      */
      setActionError(
        getApiErrorMessage(
          err,
          nextActive
            ? 'Could not switch that method on.'
            : 'Could not switch that method off.'
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          aria-label="Back to dashboard"
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Payments</h1>
        <button
          type="button"
          onClick={() => methodsQuery.refetch()}
          disabled={methodsQuery.isFetching}
          aria-label="Refresh"
          className="text-primary-dark disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={methodsQuery.isFetching ? 'animate-spin' : ''}
          />
        </button>
      </header>

      <main className="flex-1 px-5 pb-32 pt-5">
        {/* ─── Summary ─── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">Payment methods</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {methodsQuery.isLoading ? '—' : methods.length}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">Live at checkout</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {methodsQuery.isLoading ? '—' : activeCount}
            </p>
          </div>
        </div>

        {/* ─── Action error ─── */}
        {actionError && (
          <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
            {actionError}
          </p>
        )}

        {/* ─── Loading ─── */}
        {methodsQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={26} className="animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading payment methods…</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {methodsQuery.isError && !methodsQuery.isLoading && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                methodsQuery.error,
                'Could not load payment methods.'
              )}
            </p>
            <button
              type="button"
              onClick={() => methodsQuery.refetch()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* ─── Add ─── */}
        {!methodsQuery.isLoading && !methodsQuery.isError && (
          <button
            type="button"
            onClick={() => {
              setActionError('');
              setCreateOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary/40 py-3 text-sm font-semibold text-primary"
          >
            <Plus size={16} />
            New Payment Method
          </button>
        )}

        {/* ─── Empty ─── */}
        {!methodsQuery.isLoading && !methodsQuery.isError && methods.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <CreditCard size={34} className="text-gray-300" />
            <p className="text-sm text-gray-500">No payment methods yet.</p>
            <p className="max-w-xs text-xs text-gray-400">
              Customers cannot complete checkout until at least one is live.
            </p>
          </div>
        )}

        {/* ─── List ─── */}
        {!methodsQuery.isLoading && !methodsQuery.isError && methods.length > 0 && (
          <div className="mt-4 space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <span
                  className={
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' +
                    (method.isActive
                      ? 'bg-[#F3F7EE] text-primary'
                      : 'bg-gray-100 text-gray-400')
                  }
                >
                  <CreditCard size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {method.title}
                  </p>

                  {method.description && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {method.description}
                    </p>
                  )}

                  <span
                    className={
                      'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ' +
                      (method.isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-500')
                    }
                  >
                    {method.isActive ? 'Live at checkout' : 'Hidden from checkout'}
                  </span>
                </div>

                {/*
                  The switch. `aria-checked` + role="switch" so it is announced
                  as a toggle rather than as an unlabelled button.
                */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={method.isActive}
                  aria-label={`${method.isActive ? 'Disable' : 'Enable'} ${method.title}`}
                  disabled={togglingId === method.id}
                  onClick={() => handleToggle(method.id, !method.isActive)}
                  className={
                    'relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ' +
                    (method.isActive ? 'bg-primary' : 'bg-gray-300')
                  }
                >
                  <span
                    className={
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ' +
                      (method.isActive ? 'left-[22px]' : 'left-0.5')
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ─── Caveat ─── */}
        {!methodsQuery.isLoading && !methodsQuery.isError && methods.length > 0 && (
          <div className="mt-4 flex gap-2 rounded-2xl bg-gray-50 p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] text-gray-500">
              A method switched off here stops appearing as an option at
              checkout. Existing orders that already used it are unaffected.
            </p>
          </div>
        )}
      </main>

      {/* ─── Create ─── */}
      {createOpen && (
        <NewMethodDialog
          busy={createMethod.isPending}
          error={actionError}
          onCancel={() => {
            setCreateOpen(false);
            setActionError('');
          }}
          onSubmit={async (payload) => {
            setActionError('');

            try {
              await createMethod.mutateAsync(payload);
              setCreateOpen(false);
            } catch (err) {
              setActionError(
                getApiErrorMessage(err, 'Could not create the payment method.')
              );
            }
          }}
        />
      )}

      <AdminBottomNav />
    </div>
  );
}

/* =========================================================================
 * New payment method dialog
 * ========================================================================= */

function NewMethodDialog({
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    isActive: boolean;
  }) => void | Promise<void>;
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
      <div className="absolute inset-0" onClick={onCancel} aria-hidden />

      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New Payment Method</h2>
          <button
            type="button"
            onClick={onCancel}
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
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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