import axios from 'axios';

// Dev muhitida Next.js proxy orqali (/backend/*) CORS muammosidan qochamiz.
// Prod muhitida to'g'ridan-to'g'ri backendga murojaat qilamiz.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''   // proxy: /backend/api/... → next.config.ts rewrites → backend
    : 'https://wedding-backend-8.onrender.com');

// Dev proxy prefix: /backend/api/auth/login → rewrites → https://...onrender.com/api/auth/login
const PROXY_PREFIX =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/backend'
    : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — proxy prefix + auth token
api.interceptors.request.use(
  (config) => {
    // Dev muhitida /backend prefiksini qo'shamiz (CORS workaround)
    if (PROXY_PREFIX && config.url && !config.url.startsWith('http') && !config.url.startsWith('/backend')) {
      config.url = PROXY_PREFIX + config.url;
    }
    // Auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshUrl = PROXY_PREFIX
            ? `${PROXY_PREFIX}/api/auth/refresh`
            : `${API_BASE_URL}/api/auth/refresh`;
          const res = await axios.post(refreshUrl, { refreshToken });
          const { token, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Token helpers
export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
export const setTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};
export const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
