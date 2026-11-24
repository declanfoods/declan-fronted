const CODE_VERIFIED_KEY = 'declan:rider-code-verified';

function readVerifiedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(CODE_VERIFIED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    // Unreadable or corrupt — behave as if nothing was verified.
    return [];
  }
}

export function noteCodeVerified(deliveryId: string): void {
  try {
    const ids = readVerifiedIds();

    if (!ids.includes(deliveryId)) {
      sessionStorage.setItem(CODE_VERIFIED_KEY, JSON.stringify([...ids, deliveryId]));
    }
  } catch {
    /*
      Private mode or a full quota. The delivery still completes; the rider
      just loses the resume shortcut for this one, so this is swallowed.
    */
  }
}

export function clearCodeVerified(deliveryId: string): void {
  try {
    sessionStorage.setItem(
      CODE_VERIFIED_KEY,
      JSON.stringify(readVerifiedIds().filter((v) => v !== deliveryId))
    );
  } catch {
    /* see noteCodeVerified */
  }
}

export function wasCodeVerified(deliveryId: string) {
  return readVerifiedIds().includes(deliveryId);
}
