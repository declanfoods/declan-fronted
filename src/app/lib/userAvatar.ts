/*
|==========================================================================
| Profile picture — local override store  (TEMPORARY BRIDGE)
|==========================================================================
|
| WHY THIS FILE EXISTS, AND WHEN TO DELETE IT
|
| The backend can UPLOAD a picture but cannot yet STORE one against a customer
| account. Concretely, on the live server:
|
|   POST /api/v1/files                      EXISTS → 401 (guard ran first)
|     multipart, field name "files"
|     returns data.files[0].url — a Cloudinary URL
|
|   PATCH /api/v1/users/profile-picture     404  "Cannot PATCH /api/v1/users/…"
|   POST  /api/v1/users/profile-picture     404
|   PATCH /api/v1/users/profile             404
|   PATCH /api/v1/users/me                  404
|   PATCH /api/v1/users/:id                 404
|   PATCH /api/v1/users/:id/profile         404
|
| A full sweep of the 593 KB Postman collection agrees: there is no
| customer-facing endpoint that accepts `profilePictureUrl`. The field is READ
| everywhere (admin list, admin detail, referral and payout payloads, and the
| rider create request even marks it required) — it just has no writer for a
| customer.
|
| So uploading works, and then the URL has nowhere to go. Screens would show
| the new picture until the page was refreshed and then silently revert, which
| is worse than not offering the button at all.
|
| This module is the stopgap: it remembers the chosen URL ON THIS DEVICE so the
| feature behaves correctly while the endpoint is missing.
|
| ⚠️ WHAT THIS IS NOT
|   It is NOT persistence. The picture will not follow the customer to another
|     device or browser, and it is not visible to admin screens, because the
|     server never learns about it.
|   It does NOT touch the server on read or write.
|   It must NOT be presented to the user as a saved photo.
|
| ⚠️ HOW TO REMOVE IT, once the backend ships an endpoint
|   1. Add `userApi.updateProfilePicture(url)`.
|   2. In Profile.tsx, replace `setOverride(url)` with a call to it plus
|      `queryClient.invalidateQueries` on the profile key.
|   3. Delete this file and the import.
|   Everything else — the picker, the validation, the upload, the error
|   handling — stays exactly as it is. The swap is three lines.
*/

const STORAGE_KEY = 'declan:avatar-override';

/** Shape stored in localStorage: { [userId]: dataUrlOrUrl }. */
type OverrideMap = Record<string, string>;

function readAll(): OverrideMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as OverrideMap;
  } catch {
    // Corrupt or unreadable — treat as "no override" rather than throwing.
    return {};
  }
}

/**
 * The locally-chosen picture for a user, or null.
 *
 * Keyed by user id so signing out and back in as someone else does not show
 * the wrong face.
 */
export function readAvatarOverride(userId?: string | null): string | null {
  if (!userId) return null;

  const url = readAll()[userId];
  return typeof url === 'string' && url.trim() !== '' ? url : null;
}

/**
 * Records a locally-chosen picture. Pass null to clear it (used by "Remove
 * photo", which only clears the local override).
 */
export function writeAvatarOverride(userId: string, url: string | null): void {
  try {
    const all = readAll();

    if (url && url.trim() !== '') {
      all[userId] = url;
    } else {
      delete all[userId];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /*
      localStorage can throw in private mode or when the quota is full. A
      picture that fails to stick beats a crash on the profile screen, so this
      is swallowed — the avatar simply falls back to whatever the API sent.
    */
  }
}