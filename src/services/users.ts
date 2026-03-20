import { api } from './api';
import type { User, UserFilters, PaginatedResponse } from '@/types';

export const usersService = {
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/users', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
};
