import { cn } from '../utils/cn';

type Tone = 'green' | 'amber' | 'red' | 'gray';

const toneClasses: Record<Tone, string> = {
  green: 'bg-primary/10 text-primary-dark',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-500',
};

const statusTone: Record<string, Tone> = {
  // Payment statuses
  paid: 'green',
  unpaid: 'red',
  pending: 'amber',
  failed: 'red',

  // Order statuses
  processing: 'amber',
  assigned: 'green',
  picked_up: 'amber',
  in_transit: 'amber',
  code_exchanged: 'amber',
  delivered: 'green',
  completed: 'green',
  cancelled: 'red',

  // General statuses
  confirmed: 'green',
  active: 'green',
  available: 'green',
  published: 'green',
  'ready for pickup': 'green',
  preparing: 'amber',
  scheduled: 'amber',
  'out of stock': 'red',
  hidden: 'gray',
  inactive: 'gray',
  unassigned: 'gray',
  busy: 'red',
};

type StatusPillProps = {
  label?: string | null;
  tone?: Tone;
  className?: string;
  dot?: boolean;
};

export default function StatusPill({
  label,
  tone,
  className,
  dot,
}: StatusPillProps) {
  const normalizedLabel = String(label ?? '').toLowerCase();

  const resolvedTone =
    tone ?? statusTone[normalizedLabel] ?? 'gray';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        toneClasses[resolvedTone],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            resolvedTone === 'green' && 'bg-primary',
            resolvedTone === 'amber' && 'bg-amber-500',
            resolvedTone === 'red' && 'bg-red-500',
            resolvedTone === 'gray' && 'bg-gray-400'
          )}
        />
      )}

      {label || 'Unknown'}
    </span>
  );
}