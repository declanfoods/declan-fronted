import { useState } from 'react';
import {
  whatsappLink,
  defaultCustomerMessage,
} from '../../../../app/lib/whatsapp';
import {
  X,
  Eye,
  Bike,
  FileEdit,
  Phone,
  MessageSquare,
  Ban,
  Check,
  AlertTriangle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { adminOrderApi } from '../../../../app/lib/adminOrderApi';
import { useToast } from '../../../ui/Toast';

type OrderActionsSheetProps = {
  orderId: string;
  orderNumber?: string;
  customerPhone?: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

type View = 'actions' | 'cancel-confirm';

export default function OrderActionsSheet({
  orderId,
  orderNumber,
  customerPhone,
  onClose,
  onNavigate,
}: OrderActionsSheetProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<View>('actions');
  const [cancelNote, setCancelNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { showToast } = useToast();

  const displayNumber = orderNumber ?? `#${orderId.slice(0, 8)}`;

  const handleCallCustomer = async () => {
    if (!customerPhone) return;
    try {
      await navigator.clipboard.writeText(customerPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permissions denied — silently ignore
    }
  };

  const whatsappUrl = whatsappLink(
    customerPhone,
    defaultCustomerMessage(undefined, `your order ${displayNumber}`)
  );

  const handleMessageCustomer = () => {
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await adminOrderApi.cancelOrder(orderId, {note: cancelNote.trim()});

      if (!res.data.success === false) {
        throw new Error(res.data.message ?? 'Failed to cancel order. Please try again.');
      }

      showToast(res.data.message, "success");

      onClose();
    } catch (err) {
      // setCancelError(err instanceof Error ? err.message : 'Something went wrong.');
      showToast((err as any).response?.data?.message ?? 'Something went wrong.', "error")
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenCancel = () => {
    setCancelNote('');
    setCancelError(null);
    setView('cancel-confirm');
  };

  const handleBackToActions = () => {
    if (isCancelling) return;
    setView('actions');
  };

  const actions = [
    { label: 'View Details', icon: Eye, onClick: () => onNavigate(`/admin/orders/${orderId}`) },
    { label: 'Assign Rider', icon: Bike, onClick: () => onNavigate(`/admin/orders/${orderId}/assign-rider`) },
    { label: 'Update Status', icon: FileEdit, onClick: () => onNavigate(`/admin/orders/${orderId}/update-status`) },
    {
      label: copied ? 'Number Copied!' : 'Call Customer',
      icon: copied ? Check : Phone,
      onClick: handleCallCustomer,
      disabled: !customerPhone,
    },
    {
      label: 'Message on WhatsApp',
      icon: MessageSquare,
      onClick: handleMessageCustomer,
      disabled: !whatsappUrl,
    },
  ];

  const dangerActions = [
    { label: 'Cancel Order', icon: Ban, onClick: handleOpenCancel },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={isCancelling ? undefined : onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-3 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />

        {view === 'actions' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Order {displayNumber} Actions</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="flex items-center gap-3 py-3 text-left text-sm font-medium text-gray-800 disabled:opacity-40"
                  >
                    <Icon size={18} strokeWidth={2} className="text-primary" />
                    {action.label}
                  </button>
                );
              })}

              <div className="my-2 border-t border-gray-100" />

              {dangerActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="flex items-center gap-3 py-3 text-left text-sm font-medium text-red-500"
                  >
                    <Icon size={18} strokeWidth={2} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {view === 'cancel-confirm' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToActions}
                disabled={isCancelling}
                aria-label="Back"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isCancelling}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Cancel Order {displayNumber}?
              </h3>
              <p className="text-sm text-gray-500">
                This cannot be undone. The customer will be notified.
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="cancel-note"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Note (optional)
              </label>
              <textarea
                id="cancel-note"
                rows={3}
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="e.g. Item out of stock, customer requested…"
                disabled={isCancelling}
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50"
              />
            </div>

            {cancelError && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackToActions}
                disabled={isCancelling}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}