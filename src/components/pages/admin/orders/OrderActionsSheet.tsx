import { useState } from 'react';
import {
  X,
  Eye,
  Bike,
  FileEdit,
  Phone,
  MessageSquare,
 
  Ban,

  Check,
} from 'lucide-react';

type OrderActionsSheetProps = {
  orderId: string;
  orderNumber?: string;
  customerPhone?: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

export default function OrderActionsSheet({
  orderId,
  orderNumber,
  customerPhone,
  onClose,
  onNavigate,
}: OrderActionsSheetProps) {
  const [copied, setCopied] = useState(false);
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

  const handleMessageCustomer = () => {
    if (!customerPhone) return;
    const digitsOnly = customerPhone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${digitsOnly.replace('+', '')}`, '_blank');
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
      disabled: !customerPhone,
    },
   
  ];

  const dangerActions = [
    { label: 'Cancel Order', icon: Ban, onClick: () => {} },
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-3 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />

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
      </div>
    </div>
  );
}
