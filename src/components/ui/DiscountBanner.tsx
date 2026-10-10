import { useState, useEffect } from 'react';
import type { GeneralDiscount } from '../../app/lib/discountApi';
import { Tag, X } from 'lucide-react';

function useCountdown(expiresAt: Date | string) {
  const getRemaining = () => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;

    const totalSeconds = Math.floor(diff / 1000);
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => {
      const next = getRemaining();
      setRemaining(next);
      if (!next) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[28px] rounded-lg bg-white/20 px-1.5 py-0.5 text-center text-sm font-extrabold tabular-nums text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}

export function DiscountBanner({
  discount,
  onDismiss,
}: {
  discount: GeneralDiscount;
  onDismiss: () => void;
}) {
  const remaining = useCountdown(discount.expiresAt);

  // Auto-hide once expired
  if (!remaining) return null;

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl bg-primary px-4 py-3.5">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -right-2 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative">
        {/* Top row — title + dismiss */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Tag size={15} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {discount.title}
              </p>
              <p className="text-base font-extrabold text-white">
                {discount.percentageOff}% OFF everything
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <X size={13} />
          </button>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-white/20" />

        {/* Bottom row — override note + countdown */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/60">
            {discount.overrideProductDiscount
              ? 'Applies on all items including already discounted products'
              : 'Ends in'}
          </p>

          <div className="flex items-end gap-1.5">
            <CountdownUnit value={remaining.hours}   label="hrs" />
            <span className="mb-3 text-xs font-bold text-white/50">:</span>
            <CountdownUnit value={remaining.minutes} label="min" />
            <span className="mb-3 text-xs font-bold text-white/50">:</span>
            <CountdownUnit value={remaining.seconds} label="sec" />
          </div>
        </div>
      </div>
    </div>
  );
}