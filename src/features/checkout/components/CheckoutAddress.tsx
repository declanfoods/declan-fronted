import type { DeliveryAddress } from '../../account/api/addressApi';
import type { GuestDetails } from '../useCheckoutSubmission';

type CheckoutAddressProps =
  | { kind: 'guest'; details: GuestDetails; onChange: (field: keyof GuestDetails, value: string) => void }
  | {
      kind: 'account';
      addresses: DeliveryAddress[];
      selectedId?: string;
      onSelect: (id: string) => void;
      onEdit: () => void;
    };

export default function CheckoutAddress(props: CheckoutAddressProps) {
  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-primary">📍 Delivery Address</h3>
        {props.kind === 'account' && (
          <button
            type="button"
            onClick={props.onEdit}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {props.kind === 'guest' ? (
        <div className="mt-3 flex flex-col gap-3">
          <input
            value={props.details.addressLine}
            onChange={(e) => props.onChange('addressLine', e.target.value)}
            placeholder="Street address"
            required
            className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={props.details.state}
              onChange={(e) => props.onChange('state', e.target.value)}
              placeholder="State"
              className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              value={props.details.landmark}
              onChange={(e) => props.onChange('landmark', e.target.value)}
              placeholder="Nearest landmark"
              className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {props.addresses.length === 0 && (
            <div className="rounded-2xl bg-primary/10 p-5">
              <p className="text-sm text-ink-soft">
                No saved address. Please add one in your profile before ordering.
              </p>
              <button
                type="button"
                onClick={props.onEdit}
                className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
              >
                Add Address
              </button>
            </div>
          )}

          {props.addresses.map((a) => {
            const selected = a.id === props.selectedId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => props.onSelect(a.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 bg-white hover:border-primary/40'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-base font-bold text-ink">{a.state}</span>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        SELECTED
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {a.addressLine}
                    {a.country ? `, ${a.country}` : ''}
                  </span>
                  {a.nameOfCustomer && (
                    <span className="mt-1 block text-xs text-ink-soft">
                      {a.nameOfCustomer}
                      {a.phoneNumber ? ` · ${a.phoneNumber}` : ''}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {props.addresses.length > 1 && (
            <p className="pt-1 text-xs text-ink-soft">
              You have {props.addresses.length} saved addresses — pick the one this order should
              go to.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
