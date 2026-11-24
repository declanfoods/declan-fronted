// The upload endpoint returns a URL without attaching it to the customer profile.
// Store the chosen picture per account in this browser until the API supports saving it.
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
