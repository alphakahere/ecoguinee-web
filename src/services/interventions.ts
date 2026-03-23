import { api } from './api';
import type { Intervention, InterventionFilters, PaginatedResponse } from '@/types';
import type { ApiIntervention } from '@/types/api';

export const interventionsService = {
  async getAll(
    filters?: InterventionFilters,
  ): Promise<PaginatedResponse<ApiIntervention>> {
    const { data } = await api.get<PaginatedResponse<ApiIntervention>>(
      '/interventions',
      { params: filters },
    );
    return data;
  },

  async getById(id: string): Promise<Intervention> {
    const { data } = await api.get<Intervention>(`/interventions/${id}`);
    return data;
  },

  async create(
    payload: Omit<Intervention, 'id'>,
  ): Promise<Intervention> {
    const { data } = await api.post<Intervention>('/interventions', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<Intervention>,
  ): Promise<Intervention> {
    const { data } = await api.patch<Intervention>(
      `/interventions/${id}`,
      payload,
    );
    return data;
  },
};
