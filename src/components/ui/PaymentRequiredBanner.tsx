import { useState } from "react";
import { formatNaira } from "../data/products";
import { AlertTriangle, CheckCheck, Copy } from "lucide-react";


const ADMIN_WHATSAPP  = '+2347037968122';


function buildWhatsAppUrl(orderNumber: string): string {
  const message = encodeURIComponent(
    `Hi, I'm sending proof of payment for order ${orderNumber}. Please verify so my order can be processed. Thank you!`
  );
  return `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${message}`;
}

// ─── Payment required banner ──────────────────────────────────────────────────

interface PaymentBannerProps {
  orderNumber: string;
  totalWithCharge: number;
  transferCharge: number;
}

export function PaymentRequiredBanner({ 
  orderNumber, 
  totalWithCharge,
  transferCharge }: PaymentBannerProps) {
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — silently ignore
    }
  };

  return (
    <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5">
      {/* Title */}
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <h3 className="text-sm font-bold text-amber-800">Payment Required Before Processing</h3>
      </div>

      {/* Explanation */}
      <p className="mt-2 text-sm leading-relaxed text-amber-700">
        This order contains item(s) that must be paid for before we can process it.
        Please transfer{' '}
        <span className="font-bold">{formatNaira(totalWithCharge)}</span>
        {' '}(includes a {formatNaira(transferCharge)} transfer charge) to our account,
        then send proof of payment to our WhatsApp.
      </p>

      {/* Auto-cancellation notice */}
      <div className="mt-3 rounded-2xl bg-amber-100 px-4 py-3 text-xs font-medium text-amber-800">
        ⚠️ If payment is not received within <span className="font-bold">48 hours</span>,
        your order will be automatically cancelled.
      </div>

      {/* Steps */}
      <ol className="mt-4 space-y-3 text-sm text-amber-800">
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[11px] font-bold text-amber-900">
            1
          </span>
          <span>
            Copy your order number and transfer{' '}
            <span className="font-bold">{formatNaira(totalWithCharge)}</span> to our account.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[11px] font-bold text-amber-900">
            2
          </span>
          <span>Send your receipt and order number to our WhatsApp for verification.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[11px] font-bold text-amber-900">
            3
          </span>
          <span>Once verified, your order will be processed and dispatched.</span>
        </li>
      </ol>

      {/* CTA row */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={copyOrderNumber}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-amber-400 bg-white py-2.5 text-sm font-semibold text-amber-700"
        >
          {copied ? (
            <>
              <CheckCheck size={15} className="text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy Order Number
            </>
          )}
        </button>

        <a
          href={buildWhatsAppUrl(orderNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-sm font-semibold text-white"
        >
          {/* WhatsApp SVG icon */}
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send to WhatsApp
        </a>
      </div>
    </section>
  );
}