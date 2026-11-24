export type SessionRole = 'customer' | 'admin' | 'rider';

const tokenKeys = {
  customer: 'customerToken',
  admin: 'adminToken',
  rider: 'riderToken',
} as const;

export const signInPaths = {
  customer: '/login',
  admin: '/admin/login',
  rider: '/rider/login',
} as const;

export function getSessionToken(role: SessionRole): string | null {
  const token = localStorage.getItem(tokenKeys[role]);
  if (token) return token;

  if (role === 'rider' && localStorage.getItem('role') === 'rider') {
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) saveSession('rider', legacyToken);
    return legacyToken;
  }

  if (role === 'customer') {
    try {
      const legacy = JSON.parse(localStorage.getItem('auth-storage') ?? 'null');
      const legacyToken: unknown = legacy?.state?.token;
      return typeof legacyToken === 'string' && legacyToken ? legacyToken : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function saveSession(role: SessionRole, token: string) {
  localStorage.setItem(tokenKeys[role], token);
  if (role !== 'customer') localStorage.setItem('role', role);
  if (role === 'rider') localStorage.removeItem('token');
  if (role === 'customer') localStorage.removeItem('auth-storage');
}

export function clearSession(role: SessionRole) {
  localStorage.removeItem(tokenKeys[role]);

  if (role === 'customer') {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('userId');
  }
  if (role === 'rider') localStorage.removeItem('token');
  if (localStorage.getItem('role') === role) localStorage.removeItem('role');
}

export const isAuthenticated = () => Boolean(getSessionToken('customer'));
export const isAdminAuthenticated = () => (
  Boolean(getSessionToken('admin')) && localStorage.getItem('role') === 'admin'
);

export function logout(role: SessionRole = 'customer') {
  clearSession(role);
  window.location.href = role === 'customer' ? '/' : signInPaths[role];
}
