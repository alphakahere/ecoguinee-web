import { api } from './api';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters,
  PaginatedResponse,
} from '@/types';
import type { UserStatus } from '@/lib/types';

export const usersService = {
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User> | User[]>('/users', {
      params: filters,
    });
    if (Array.isArray(data)) {
      return { data, total: data.length, page: 1, pageSize: data.length };
    }
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, { status });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
