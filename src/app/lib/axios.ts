import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-declanfoods.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach the appropriate token to every request
api.interceptors.request.use(
  (config) => {
    const riderToken = localStorage.getItem('riderToken');
    const userToken = localStorage.getItem('token');

    // Rider routes use riderToken.
    // Everything else falls back to the normal user token.
    const isRiderRequest =
      config.url?.includes('/delivery-rider') ||
      config.url?.includes('/delivery-riders');

    const token = isRiderRequest ? riderToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    const isRiderRequest =
      url.includes('/delivery-rider') ||
      url.includes('/delivery-riders');

    if (status === 401) {
      if (isRiderRequest) {
        localStorage.removeItem('riderToken');
        localStorage.removeItem('riderId');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
