import { api } from './api';
import type {
  ApiSME,
  SMEFilters,
  ApiPaginatedResponse,
  CreateSMEPayload,
  UpdateSMEPayload,
} from '@/types/api';

function normalize(data: ApiPaginatedResponse<ApiSME> | ApiSME[]): ApiPaginatedResponse<ApiSME> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length };
  }
  return data;
}

export const smesService = {
  async getAll(filters?: SMEFilters): Promise<ApiPaginatedResponse<ApiSME>> {
    const { data } = await api.get<ApiPaginatedResponse<ApiSME> | ApiSME[]>('/smes', {
      params: filters,
    });
    return normalize(data);
  },

  async getById(id: string): Promise<ApiSME> {
    const { data } = await api.get<ApiSME>(`/smes/${id}`);
    return data;
  },

  async create(payload: CreateSMEPayload): Promise<ApiSME> {
    const { data } = await api.post<ApiSME>('/smes', payload);
    return data;
  },

  async update(id: string, payload: UpdateSMEPayload): Promise<ApiSME> {
    const { data } = await api.patch<ApiSME>(`/smes/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/smes/${id}`);
  },
};
