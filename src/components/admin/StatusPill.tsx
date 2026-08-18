import type { AdminOrderStatus } from '../../app/lib/adminOrderApi';

interface StatusPillProps {
  label: string | AdminOrderStatus;
  dot?: boolean;
}

const statusStyles: Record<
  string,
  {
    container: string;
    text: string;
    dot: string;
  }
> = {
  PENDING: {
    container: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },

  PROCESSING: {
    container: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },

  ASSIGNED: {
    container: 'bg-indigo-50',
    text: 'text-indigo-600',
    dot: 'bg-indigo-500',
  },

  PICKED_UP: {
    container: 'bg-purple-50',
    text: 'text-purple-600',
    dot: 'bg-purple-500',
  },

  IN_TRANSIT: {
    container: 'bg-cyan-50',
    text: 'text-cyan-600',
    dot: 'bg-cyan-500',
  },

  CODE_EXCHANGED: {
    container: 'bg-violet-50',
    text: 'text-violet-600',
    dot: 'bg-violet-500',
  },

  DELIVERED: {
    container: 'bg-green-50',
    text: 'text-green-600',
    dot: 'bg-green-500',
  },

  COMPLETED: {
    container: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },

  CANCELLED: {
    container: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },

  PAID: {
    container: 'bg-green-50',
    text: 'text-green-600',
    dot: 'bg-green-500',
  },

  PENDING_PAYMENT: {
    container: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },

  FAILED: {
    container: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
};

function formatLabel(label: string) {
  return label
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default function StatusPill({
  label,
  dot = false,
}: StatusPillProps) {
  const key = String(label).toUpperCase();

  const style = statusStyles[key] ?? {
    container: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.container} ${style.text}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
        />
      )}

      {formatLabel(String(label))}
    </span>
  );
}