import axios from 'axios';
import { clearSession, getSessionToken, signInPaths, type SessionRole } from '../../features/auth/session';

declare module 'axios' {
  interface AxiosRequestConfig {
    authScope?: SessionRole;
  }
}

const baseURL = import.meta.env.VITE_API_URL ?? 'https://api-declanfoods.onrender.com';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45_000,
});

function requestPath(url = '') {
  return new URL(url, window.location.origin).pathname;
}

function getScope(path: string): SessionRole {
  if (/^\/api\/v1\/admin(?:\/|$)/.test(path)) return 'admin';
  if (/^\/api\/v1\/delivery-riders?(?:\/|$)/.test(path)) return 'rider';
  return 'customer';
}

function isAuthenticationRequest(path: string) {
  return /\/(?:auth\/|login(?:\/|$)|change-password(?:\/|$))/.test(path);
}

api.interceptors.request.use((config) => {
  const scope = config.authScope ?? getScope(requestPath(config.url));
  config.authScope = scope;

  const token = getSessionToken(scope);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const { authScope, headers, url } = error.config;
    if (authScope && !isAuthenticationRequest(requestPath(url))) {
      const currentToken = getSessionToken(authScope);
      if (currentToken && headers.get('Authorization') === `Bearer ${currentToken}`) {
        clearSession(authScope);
        window.location.href = signInPaths[authScope];
      }
    }

    return Promise.reject(error);
  },
);

export default api;
