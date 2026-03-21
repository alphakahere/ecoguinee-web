import { api } from './api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<{ access_token: string; user: AuthResponse['user'] }>(
      '/auth/login',
      { emailOrPhone, password },
    );
    return { token: data.access_token, user: data.user };
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },
};
