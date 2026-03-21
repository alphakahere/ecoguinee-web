import { api } from './api';
import type {
  ApiZone,
  ZoneFilters,
  ApiPaginatedResponse,
  CreateZonePayload,
  UpdateZonePayload,
} from '@/types/api';

function normalize(data: ApiPaginatedResponse<ApiZone> | ApiZone[]): ApiPaginatedResponse<ApiZone> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length };
  }
  return data;
}

export const zonesService = {
  async getAll(filters?: ZoneFilters): Promise<ApiPaginatedResponse<ApiZone>> {
    const { data } = await api.get<ApiPaginatedResponse<ApiZone> | ApiZone[]>('/zones', {
      params: filters,
    });
    return normalize(data);
  },

  async getById(id: string): Promise<ApiZone> {
    const { data } = await api.get<ApiZone>(`/zones/${id}`);
    return data;
  },

  async getChildren(parentId: string): Promise<ApiZone[]> {
    const { data } = await api.get<ApiZone[]>(`/zones/${parentId}/children`);
    return data;
  },

  async create(payload: CreateZonePayload): Promise<ApiZone> {
    const { data } = await api.post<ApiZone>('/zones', payload);
    return data;
  },

  async update(id: string, payload: UpdateZonePayload): Promise<ApiZone> {
    const { data } = await api.patch<ApiZone>(`/zones/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/zones/${id}`);
  },

  async getTree(): Promise<ApiZone[]> {
    const { data } = await api.get<ApiZone[]>('/zones/tree');
    return data;
  },
};
