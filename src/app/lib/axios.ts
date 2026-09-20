import axios from 'axios';

/*
|--------------------------------------------------------------------------
| Axios instance
|--------------------------------------------------------------------------
| FIXES APPLIED
| 1. baseURL was hardcoded to the Render URL — now reads VITE_API_URL with
|    the same hardcoded value as fallback, so nothing breaks if the env var
|    is not set yet.
| 2. Removed a `console.log('AUTH DEBUG', …)` that printed a slice of the
|    user's bearer token to the browser console on EVERY request. That is a
|    credential leak — anyone with devtools (or a screen-recording) gets a
|    partial token.
| 3. 401 handling now clears the matching token + bounces to the right login
|    screen instead of only console.error-ing, so an expired admin token
|    doesn't leave the user stuck on a dashboard that silently renders blanks.
*/

const baseURL = import.meta.env.VITE_API_URL ?? 'https://api-declanfoods.onrender.com';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  /*
  |--------------------------------------------------------------------------
  | FIX: timeout 20s → 45s
  |--------------------------------------------------------------------------
  | The backend runs on Render, which spins down idle instances. A cold start
  | can take 30–50 seconds. At a 20s timeout every first request after a quiet
  | period failed with ECONNABORTED — which surfaced to admins as a vague
  | "couldn't load" error even though the server was simply still booting.
  */
  timeout: 45000,
});

type AuthScope = 'rider' | 'admin' | 'customer';

/**
 * Works out which token bucket a URL belongs to, then returns the token.
 * URL prefix is the source of truth — the three apps share one backend.
 */
function resolveAuth(url: string): { token: string | null; scope: AuthScope } {
  /*
  |--------------------------------------------------------------------------
  | FIX: "Authorization header missing" on the whole rider app
  |--------------------------------------------------------------------------
  | The rider endpoints live at BOTH of these paths:
  |
  |   /api/v1/delivery-riders/...   ← the "r" is not a typo; riderApi.ts
  |   /api/v1/delivery-rider/...      riderDeliveryApi.ts uses the singular
  |
  | `startsWith('/api/v1/delivery-rider')` happens to cover both, because the
  | plural one also starts with the singular string. That part worked. It was
  | kept as-is but written down here, because it looks like a bug and someone
  | will "fix" it into one.
  |
  | The actual cause of the error was the OTHER half of this line:
  |
  |   RiderLogin.tsx wrote  localStorage.setItem('token', …)
  |   this line read        localStorage.getItem('riderToken')
  |
  | Different keys, so `token` was always null, so no Authorization header was
  | ever attached — and the backend answered "Authorization header missing"
  | for every rider request.
  |
  | Order doesn't matter between the two prefix checks below:
  | /api/v1/admin/delivery-riders starts with "/api/v1/admin", and
  | /api/v1/delivery-riders/... starts with "/api/v1/delivery-rider". Neither
  | can be mistaken for the other.
  */
  if (url.startsWith('/api/v1/delivery-rider')) {
    let riderToken = localStorage.getItem('riderToken');

    /*
      Back-compat: anyone already signed in before this fix has the token under
      the bare `token` key. Pick it up and promote it, so nobody gets logged out
      by the deploy.
    */
    if (!riderToken && localStorage.getItem('role') === 'rider') {
      const legacy = localStorage.getItem('token');

      if (legacy) {
        riderToken = legacy;
        localStorage.setItem('riderToken', legacy);
        localStorage.removeItem('token');
      }
    }

    return { token: riderToken, scope: 'rider' };
  }

  /*
  |--------------------------------------------------------------------------
  | FIX: uploads sent the wrong token
  |--------------------------------------------------------------------------
  | POST /api/v1/files is the one generic upload endpoint in this API — no
  | admin prefix, no rider prefix. The profile picture on the customer's
  | profile screen goes through it, and so does every product / foodpack image
  | in the admin app (AdminImageUpload.tsx → uploadApi.uploadFile).
  |
  | Because the path has no `admin` or `delivery-rider` prefix it fell through
  | to the customer branch below, which reads `customerToken` and the
  | `auth-storage` fallback. For a customer that happens to be correct. For a
  | signed-in ADMIN there is no customer token, so no Authorization header was
  | attached at all — and the live endpoint answers 401, so every admin image
  | upload failed.
  |
  | The fix is to pick the token that matches whoever is actually signed in,
  | rather than guessing from a path that carries no scope. This only changes
  | behaviour for this one URL: when a customer token exists, it is still the
  | one used.
  */
  if (url.startsWith('/api/v1/files')) {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      return { token: localStorage.getItem('adminToken'), scope: 'admin' };
    }

    if (role === 'rider') {
      return { token: localStorage.getItem('riderToken'), scope: 'rider' };
    }

    return { token: localStorage.getItem('customerToken'), scope: 'customer' };
  }

  if (url.startsWith('/api/v1/admin')) {
    return { token: localStorage.getItem('adminToken'), scope: 'admin' };
  }

  let token = localStorage.getItem('customerToken');

  // Fallback to the zustand auth-storage shape used by the customer app.
  if (!token) {
    const authStorage = localStorage.getItem('auth-storage');

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token ?? null;
      } catch {
        // Corrupt auth-storage — ignore and fall through to unauthenticated.
      }
    }
  }

  return { token, scope: 'customer' };
}

api.interceptors.request.use(
  (config) => {
    const { token } = resolveAuth(config.url ?? '');

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      const { scope } = resolveAuth(url);

      /*
        Don't fight the login screens — never bounce away from a sign-in call.
        `/change-password` is included for the same reason: the forced
        first-login password change is a gate, and bouncing the rider back to
        the login screen on a 401 meant they could never get past it — they
        were pushed into a login → change-password → login loop with no way to
        read what actually went wrong. Now the screen shows the error instead.
      */
      const isAuthCall =
        url.includes('/auth/') ||
        url.includes('/login') ||
        url.includes('/change-password');

      if (!isAuthCall) {
        if (scope === 'admin') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('role');
          window.location.href = '/admin/login';
        } else if (scope === 'rider') {
          // Clear the legacy key too, so no half-expired session is left behind.
          localStorage.removeItem('riderToken');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/rider/login';
        } else {
          localStorage.removeItem('customerToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;