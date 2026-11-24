import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import AdminBottomNav from '../../../../app/layouts/admin/AdminBottomNav';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import type { CreatePaymentMethodPayload } from '../api';
import NewMethodDialog from '../components/NewMethodDialog';
import PaymentMethodRow from '../components/PaymentMethodRow';
import {
  useAdminPaymentMethods,
  useCreatePaymentMethod,
  usePendingPaymentToggles,
  useTogglePaymentMethod,
} from '../queries';

export default function PaymentMethods() {
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [createError, setCreateError] = useState('');

  const methodsQuery = useAdminPaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const toggleMethod = useTogglePaymentMethod();
  const pendingToggles = usePendingPaymentToggles();

  const methods = (methodsQuery.data ?? []).map((method) => ({
    ...method,
    isActive: pendingToggles.get(method.id) ?? method.isActive,
  }));
  const activeCount = methods.filter((method) => method.isActive).length;
  const methodsLoaded = methodsQuery.isSuccess;

  const handleToggle = async (id: string, active: boolean) => {
    if (pendingToggles.has(id)) return;
    setActionError('');

    try {
      await toggleMethod.mutateAsync({ id, active });
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Could not update the payment method.'));
    }
  };

  const handleCreate = async (payload: CreatePaymentMethodPayload) => {
    if (createMethod.isPending) return;
    setCreateError('');

    try {
      await createMethod.mutateAsync(payload);
      setCreateOpen(false);
    } catch (error) {
      setCreateError(getApiErrorMessage(error, 'Could not create the payment method.'));
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
          <p role="alert" className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
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
        {methodsLoaded && (
          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setCreateOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary/40 py-3 text-sm font-semibold text-primary"
          >
            <Plus size={16} />
            New Payment Method
          </button>
        )}

        {/* ─── Empty ─── */}
        {methodsLoaded && methods.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <CreditCard size={34} className="text-gray-300" />
            <p className="text-sm text-gray-500">No payment methods yet.</p>
            <p className="max-w-xs text-xs text-gray-400">
              Customers cannot complete checkout until at least one is live.
            </p>
          </div>
        )}

        {/* ─── List ─── */}
        {methodsLoaded && methods.length > 0 && (
          <div className="mt-4 space-y-3">
            {methods.map((method) => (
              <PaymentMethodRow
                key={method.id}
                method={method}
                pending={pendingToggles.has(method.id)}
                onToggle={() => handleToggle(method.id, !method.isActive)}
              />
            ))}
          </div>
        )}

        {/* ─── Caveat ─── */}
        {methodsLoaded && methods.length > 0 && (
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
          error={createError}
          onCancel={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      <AdminBottomNav />
    </div>
  );
}
