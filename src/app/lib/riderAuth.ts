/*
|--------------------------------------------------------------------------
| Rider session
|--------------------------------------------------------------------------
| FIX: "clicking logout as rider redirects to the main page login page"
|
| RiderProfile.tsx was calling `logout()` from app/lib/auth.ts — the
| CUSTOMER logout. Look at what that does:
|
|   localStorage.removeItem('customerToken');   ← not the rider's key
|   localStorage.removeItem('userId');
|   localStorage.removeItem('role');
|   window.location.href = '/login';            ← the CUSTOMER login page
|
| Three things were wrong with that:
|
|   1. It never removed `riderToken`. The rider's token stayed in
|      localStorage, so the "logged out" rider was still authenticated —
|      going back to any /rider/* screen just worked again. That is a real
|      security problem, not just a cosmetic one.
|   2. It DID remove `customerToken`, so a rider logging out would also kill
|      a customer session if both existed in the same browser.
|   3. It hard-redirected to /login. The `navigate('/rider/login')` on the
|      line after it was dead code — `window.location.href` tears the page
|      down before navigate() can run. That is the bug that was visible.
|
| This module is the rider equivalent. The three apps share one origin and
| one localStorage, so each has to clean up only its own keys.
*/

/** Keys that belong to a rider session. */
const RIDER_KEYS = [
  'riderToken',
  // Legacy key from before the rider-token fix. Cleared so no half-expired
  // session is left behind by a logout.
  'token',
] as const;

/**
 * True when a rider token is present. Mirrors `isAuthenticated()` in the
 * customer auth module.
 */
export const isRiderAuthenticated = () => !!localStorage.getItem('riderToken');

export const getRiderToken = () => localStorage.getItem('riderToken');

/**
 * Clears the rider session and returns to the RIDER login screen.
 *
 * Only rider keys are touched. `customerToken` and `adminToken` are left
 * alone so logging out of the rider app never signs anyone out of the other
 * two apps in the same browser.
 *
 * `role` is shared by all three apps, so it is only cleared when it actually
 * says "rider" — otherwise a customer session in the same browser would lose
 * its role marker.
 */
export const riderLogout = () => {
  RIDER_KEYS.forEach((key) => localStorage.removeItem(key));

  if (localStorage.getItem('role') === 'rider') {
    localStorage.removeItem('role');
  }

  window.location.href = '/rider/login';
};