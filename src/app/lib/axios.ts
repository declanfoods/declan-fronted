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
  if (url.startsWith('/api/v1/delivery-rider')) {
    return { token: localStorage.getItem('riderToken'), scope: 'rider' };
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

      // Don't fight the login screens — never bounce away from a sign-in call.
      const isAuthCall = url.includes('/auth/') || url.includes('/login');

      if (!isAuthCall) {
        if (scope === 'admin') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('role');
          window.location.href = '/admin/login';
        } else if (scope === 'rider') {
          localStorage.removeItem('riderToken');
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