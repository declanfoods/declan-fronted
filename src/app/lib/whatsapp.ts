/*
|--------------------------------------------------------------------------
| WhatsApp deep links
|--------------------------------------------------------------------------
| Replaces the "Send Notification" action, which called
| `POST /admin/users/:id/notify` — an endpoint that does not exist on the
| backend, so the button could only ever fail.
|
| This needs no backend at all: `wa.me` opens WhatsApp (app or web) with the
| recipient's number pre-filled. WhatsApp is where Nigerian customers actually
| are, so this reaches them where a notification wouldn't have.
|
| The numbers in the API arrive in mixed formats:
|   "+2349139935930"   ← the usual one
|   "09139935930"      ← local form
|   "2349139935930"    ← missing plus
|   "+234 913 993 5930" / "(091) 3993 5930"  ← with punctuation
|
| wa.me only accepts digits with a country code and NO plus sign, so all of
| those have to be normalised first. Getting this wrong yields a link that
| opens WhatsApp to a dead number, which is worse than no link at all.
*/

const DEFAULT_COUNTRY_CODE = '234'; // Nigeria

/**
 * Normalises a phone number into the digits-only, country-coded form wa.me
 * needs. Returns null when there aren't enough digits to be a real number,
 * so callers can disable the action instead of linking somewhere broken.
 */
export function normalisePhoneForWhatsApp(phone?: string | null): string | null {
  if (!phone) return null;

  // Drop everything that isn't a digit (spaces, +, dashes, parens).
  let digits = phone.replace(/\D/g, '');

  if (!digits) return null;

  // Local form: 09139935930 → 2349139935930
  if (digits.startsWith('0')) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  } else if (digits.length === 10 && !digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    // Bare 10-digit NUBAN-style local number with the leading 0 already gone.
    digits = DEFAULT_COUNTRY_CODE + digits;
  }

  // A Nigerian number in international form is 13 digits (234 + 10).
  // Reject anything obviously too short to be dialable.
  if (digits.length < 10) return null;

  return digits;
}

/**
 * Builds a wa.me link with an optional pre-filled message.
 * Returns null when the number can't be normalised — check for it and disable
 * the button rather than rendering a dead link.
 */
export function whatsappLink(phone?: string | null, message?: string): string | null {
  const number = normalisePhoneForWhatsApp(phone);
  if (!number) return null;

  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** A sensible default opener, so the admin isn't staring at an empty chat. */
export function defaultCustomerMessage(name?: string | null, context?: string): string {
  const first = (name ?? '').trim().split(' ')[0];
  const greeting = first ? `Hello ${first}` : 'Hello';

  return context
    ? `${greeting}, this is Declan Foods. Regarding ${context}: `
    : `${greeting}, this is Declan Foods. `;
}