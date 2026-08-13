import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-declanfoods.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;


    if (status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }

    return Promise.reject(error);
  }
);

export default api;