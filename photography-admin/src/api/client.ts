import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import CryptoJS from 'crypto-js';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.fulltimephotographers.com/api/v1';
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY || '';
const SECRET   = process.env.NEXT_PUBLIC_HMAC_SECRET || '';

// ─── Device ID ──────────────────────────────────────────────────────────────
const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return 'ssr-device';
  const stored = localStorage.getItem('deviceId');
  if (stored) return stored;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem('deviceId', id);
  return id;
};

const DEVICE_ID = getOrCreateDeviceId();

// ─── Axios Client ────────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Refresh-token queue ─────────────────────────────────────────────────────
let isRefreshing = false;
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject:  (error: unknown) => void;
}
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ─── HMAC helper ─────────────────────────────────────────────────────────────
const buildHmacHeaders = (body: unknown) => {
  const timestamp = Date.now().toString();
  const bodyStr   = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '{}';
  const signature = CryptoJS.HmacSHA256(bodyStr + timestamp, SECRET).toString(CryptoJS.enc.Hex);
  return { timestamp, signature };
};

// ─── Token helpers ───────────────────────────────────────────────────────────
export const storeTokens = (accessToken: string, refreshTokenValue: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', accessToken);
  localStorage.setItem('refreshToken', refreshTokenValue);
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Auth token (only present after login)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. Device ID — always present
    config.headers.set('x-device-id', DEVICE_ID);

    // 3. HMAC signature
    const { timestamp, signature } = buildHmacHeaders(config.data);
    config.headers.set('x-api-key',   API_KEY);
    config.headers.set('x-timestamp', timestamp);
    config.headers.set('x-signature', signature);

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Queue subsequent 401s while a refresh is in flight
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefresh =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      // No refresh token — redirect to login immediately
      if (!storedRefresh) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Use /admin/refresh_token to match the auth.ts endpoint
        const refreshPayload = { refresh_token: storedRefresh };
        const { timestamp, signature } = buildHmacHeaders(refreshPayload);

        // Stand-alone axios instance to avoid interceptor recursion
        const refreshInstance = axios.create({ baseURL: BASE_URL });
        const { data } = await refreshInstance.post('/admin/refresh_token', refreshPayload, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key':    API_KEY,
            'x-timestamp':  timestamp,
            'x-signature':  signature,
            'x-device-id':  DEVICE_ID,
          },
        });

        // API shape: { success, data: { access_token, refresh_token }, message }
        const newAccessToken  = data?.data?.access_token;
        const newRefreshToken = data?.data?.refresh_token;

        if (!newAccessToken) throw new Error('Token refresh response missing access_token');

        storeTokens(newAccessToken, newRefreshToken ?? storedRefresh);

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;