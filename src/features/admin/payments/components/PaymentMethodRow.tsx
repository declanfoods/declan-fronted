import { CreditCard } from 'lucide-react';
import type { AdminPaymentMethod } from '../api';

interface PaymentMethodRowProps {
  method: AdminPaymentMethod;
  pending: boolean;
  onToggle: () => void;
}

export default function PaymentMethodRow({ method, pending, onToggle }: PaymentMethodRowProps) {
  return (
    <div
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

      <button
        type="button"
        role="switch"
        aria-checked={method.isActive}
        aria-label={`${method.isActive ? 'Disable' : 'Enable'} ${method.title}`}
        disabled={pending}
        onClick={onToggle}
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
  );
}
