import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

/** Extract a user-facing error message from Axios errors or plain Errors. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/forgot-password');
      if (!isAuthRoute) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);
