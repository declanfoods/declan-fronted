import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { OrderPayment } from '../api/orderApi';

const BANK_NAME = "Palmpay";
const BANK_ACCOUNT = "8923521478";
const ACCOUNT_NAME = "Declan Foods"

export default function TrackingPayment({ payment, mode, paysByTransfer }: {
  payment: OrderPayment;
  mode: 'account' | 'guest';
  paysByTransfer: boolean;
}) {
  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-primary">💳 Payment</h3>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{payment.paymentMethod}</p>
          {mode === 'account' && (
            <>
              <p>{payment.paymentMethodDescription}</p>
              {paysByTransfer && (
                <div className="mt-3 rounded-2xl bg-primary/10 p-4 text-sm">
                  <p className="font-bold text-ink">Pay into this account:</p>
                  <p className="mt-1 text-ink-soft">Bank: <span className="font-semibold text-ink">{BANK_NAME}</span></p>
                  <p className="text-ink-soft">Acc. No: <span className="font-semibold text-ink">{BANK_ACCOUNT}</span></p>
                  <p className="text-ink-soft">Acc. Name: <span className="font-semibold text-ink">{ACCOUNT_NAME}</span></p>
                </div>
              )}
            </>
          )}
          <span className={
            'mt-1 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ' +
            (payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')
          }>
            {payment.paymentStatus}
          </span>
        </div>
        {mode === 'guest' && (
          <p className="text-xl font-extrabold text-ink">{formatNaira(payment.amount)}</p>
        )}
      </div>
    </section>
  );
}
