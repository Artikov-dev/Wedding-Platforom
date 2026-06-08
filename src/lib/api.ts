import axios from 'axios';

// Barcha muhitlarda Next.js proxy orqali so'rov yuboramiz (CORS muammosidan qochish uchun).
// /backend/api/... → next.config.ts rewrites → https://wedding-backend-8.onrender.com/api/...
const API_BASE_URL = '';

// Proxy prefix: har doim /backend prefiksini ishlatamiz
const PROXY_PREFIX = '/backend';

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

// Render free tier uyquga ketmasligi uchun — har 9 daqiqada bir ping
if (typeof window !== 'undefined') {
  const PING_URL = '/backend/api/halls/search?limit=1';
  const PING_INTERVAL = 9 * 60 * 1000; // 9 daqiqa
  const ping = () => fetch(PING_URL, { method: 'GET' }).catch(() => {});
  ping(); // sahifa ochilganda darhol bir marta
  setInterval(ping, PING_INTERVAL);
}

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
