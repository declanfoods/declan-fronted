import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { DirectReferral } from '../../app/lib/referralApi';


type Template = {
  key: string;
  label: string;
  build: (name: string) => string;
};

const TEMPLATES: Template[] = [
  {
    key: 'nudge',
    label: 'Nudge to order',
    build: (name) =>
      `Hi ${name}! 👋 Just checking in — you're on your way to qualifying on Declan Foods. A few more orders and you'll unlock your commission. Let me know if you need any help!`,
  },
  {
    key: 'congratulate',
    label: 'Congratulate',
    build: (name) =>
      `${name}! 🎉 You've qualified on Declan Foods — your commission is now active. Keep up the great work and keep those orders coming in!`,
  },
  {
    key: 'checkin',
    label: 'Check in',
    build: (name) =>
      `Hey ${name}, just dropping in to see how things are going on Declan Foods. Any questions or anything I can help with? I'm here!`,
  },
  {
    key: 'promo',
    label: 'Share promo',
    build: (name) =>
      `Hi ${name}! 🛍️ There's a great promo running on Declan Foods right now — perfect time to place an order and earn more. Don't miss out!`,
  },
];

type Props = {
  referral: DirectReferral;
  onClose: () => void;
};

export default function MessageModal({ referral, onClose }: Props) {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].key);
  const [message, setMessage] = useState(
    TEMPLATES[0].build(referral.fullname?.split(' ')[0] ?? 'there'),
  );
  const backdropRef = useRef<HTMLDivElement>(null);

  const firstName = referral.fullname?.split(' ')[0] ?? 'there';

  const initials =
    referral.fullname
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function selectTemplate(t: Template) {
    setActiveTemplate(t.key);
    setMessage(t.build(firstName));
  }

  function openWhatsApp() {
    const raw = referral.phoneNumber.replace(/\D/g, '');
    // Normalize Nigerian numbers: 0XXXXXXXXXX → 234XXXXXXXXXX
    const normalized = raw.startsWith('0') ? `234${raw.slice(1)}` : raw;
    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    // Backdrop — clicking outside closes
    <div
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl bg-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Message {referral.fullname}
              </p>
              <p className="text-xs text-white/70">via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Template chips */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Choose a template
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => selectTemplate(t)}
                className={
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                  (activeTemplate === t.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Editable message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="mt-4 w-full resize-none rounded-2xl border-2 border-primary/20 p-3 text-sm text-ink
                       placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-2
                       focus:ring-primary/20"
          />

          {/* WhatsApp CTA */}
          <button
            onClick={openWhatsApp}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366]
                       py-3.5 text-sm font-bold text-white hover:brightness-95 active:scale-[0.98]"
          >
            <WhatsAppIcon />
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}