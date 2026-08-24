import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-declanfoods.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';

    let token: string | null = null;

    // Rider API
    if (url.startsWith('/api/v1/delivery-rider')) {
      token = localStorage.getItem('riderToken');
    }

    // Admin API
    else if (url.startsWith('/api/v1/admin')) {
      token = localStorage.getItem('adminToken');
    }

    // Customer API
    else {
      token = localStorage.getItem('customerToken');

      // Fallback to existing auth-storage
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');

        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.token ?? null;
          } catch (error) {
            console.error('Failed to read auth storage:', error);
          }
        }
      }
    }
console.log('AUTH DEBUG:', {
  url: config.url,
  tokenFound: !!token,
  tokenPreview: token ? `${token.slice(0, 20)}...` : null,
  riderToken: !!localStorage.getItem('riderToken'),
  customerToken: !!localStorage.getItem('customerToken'),
  adminToken: !!localStorage.getItem('adminToken'),
});
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
      console.error(
        'API authorization failed:',
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;
