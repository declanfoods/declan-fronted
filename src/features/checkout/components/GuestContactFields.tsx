import type { GuestDetails } from '../useCheckoutSubmission';

export default function GuestContactFields({ details, onChange }: {
  details: GuestDetails;
  onChange: (field: keyof GuestDetails, value: string) => void;
}) {
  return (
    <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-primary">👤 Contact Details</h3>
      <div className="mt-3 flex flex-col gap-3">
        <input
          value={details.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Full name"
          required
          className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
        />
        <input
          type="email"
          value={details.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
        />
        <input
          type="tel"
          value={details.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="Phone number"
          required
          className="w-full rounded-2xl border border-muted p-4 text-sm text-ink outline-none focus:border-primary"
        />
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        We&apos;ll send your order confirmation and tracking link to this email.
      </p>
    </section>
  );
}
