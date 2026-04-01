import { api } from './api';
import type {
  ApiOrganization,
  OrganizationFilters,
  ApiPaginatedResponse,
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
} from '@/types/api';

function normalize(data: ApiPaginatedResponse<ApiOrganization> | ApiOrganization[]): ApiPaginatedResponse<ApiOrganization> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length };
  }
  return data;
}

export const organizationsService = {
  async getAll(filters?: OrganizationFilters): Promise<ApiPaginatedResponse<ApiOrganization>> {
    const { data } = await api.get<ApiPaginatedResponse<ApiOrganization> | ApiOrganization[]>('/organizations', {
      params: filters,
    });
    return normalize(data);
  },

  async getById(id: string): Promise<ApiOrganization> {
    const { data } = await api.get<ApiOrganization>(`/organizations/${id}`);
    return data;
  },

  async create(payload: CreateOrganizationPayload): Promise<ApiOrganization> {
    const { data } = await api.post<ApiOrganization>('/organizations', payload);
    return data;
  },

  async update(id: string, payload: UpdateOrganizationPayload): Promise<ApiOrganization> {
    const { data } = await api.patch<ApiOrganization>(`/organizations/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },
};
