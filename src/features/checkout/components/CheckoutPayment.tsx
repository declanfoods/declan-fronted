import type { PaymentMethod } from '../api/paymentApi';

export default function CheckoutPayment({ paymentMethods, selectedPayment, onSelect }: {
  paymentMethods: PaymentMethod[];
  selectedPayment?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-primary">💳 Payment Method</h3>
      {paymentMethods.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">No payment methods available.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={
                'flex cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-4 transition-colors ' +
                (selectedPayment === method.id
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-primary/50')
              }
            >
              <div>
                <p className="text-base font-semibold text-ink">{method.title}</p>
                {method.description && (
                  <p className="mt-0.5 text-xs text-ink-soft">{method.description}</p>
                )}
              </div>
              <input
                type="radio"
                name="payment"
                checked={selectedPayment === method.id}
                onChange={() => onSelect(method.id)}
                className="h-5 w-5 accent-primary"
              />
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
