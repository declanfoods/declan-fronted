import {
  X,
  Eye,
  Bike,
  FileEdit,
  Phone,
  MessageSquare,
  Copy,
  Receipt,
  Ban,
  Wallet,
  Trash2,
} from 'lucide-react';

type OrderActionsSheetProps = {
  orderId: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

export default function OrderActionsSheet({ orderId, onClose, onNavigate }: OrderActionsSheetProps) {
  const cleanId = orderId.replace('#', '');

  const actions = [
    { label: 'View Details', icon: Eye, onClick: () => onNavigate(`/admin/orders/${cleanId}`) },
    { label: 'Assign Rider', icon: Bike, onClick: () => onNavigate(`/admin/orders/${cleanId}/assign-rider`) },
    { label: 'Update Status', icon: FileEdit, onClick: () => onNavigate(`/admin/orders/${cleanId}/update-status`) },
    { label: 'Call Customer', icon: Phone, onClick: () => {} },
    { label: 'Message Customer', icon: MessageSquare, onClick: () => {} },
    { label: 'Duplicate Order', icon: Copy, onClick: () => {} },
    { label: 'Print Invoice', icon: Receipt, onClick: () => {} },
  ];

  const dangerActions = [
    { label: 'Cancel Order', icon: Ban, onClick: () => {} },
    { label: 'Refund Order', icon: Wallet, onClick: () => {} },
    { label: 'Delete Order', icon: Trash2, onClick: () => {} },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-3 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Order {orderId} Actions</h2>
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
                className="flex items-center gap-3 py-3 text-left text-sm font-medium text-gray-800"
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
      </div>
    </div>
  );
}
