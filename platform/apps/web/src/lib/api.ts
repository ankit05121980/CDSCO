import axios, { AxiosInstance } from 'axios';

const TOKEN_KEY = 'athena.accessToken';
const REFRESH_KEY = 'athena.refreshToken';

/** Same-origin API base; Next.js rewrites `/api/*` to the backend service. */
export const api: AxiosInstance = axios.create({ baseURL: '/api' });

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend wraps responses in `{ success, data, meta }`; unwrap to `data`.
api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      clearTokens();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
