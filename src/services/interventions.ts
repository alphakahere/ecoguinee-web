import { api } from './api';
import type { InterventionFilters, PaginatedResponse } from '@/types';
import type { ApiIntervention } from '@/types/api';
import type { UpdateInterventionPayload } from '@/hooks/mutations/useUpdateIntervention';

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

  async getById(id: string): Promise<ApiIntervention> {
    const { data } = await api.get<ApiIntervention>(`/interventions/${id}`);
    return data;
  },

  async create(
    payload: Omit<
      ApiIntervention,
      'id' | 'createdAt' | 'updatedAt' | 'agent' | 'report' | 'sme'
    >,
  ): Promise<ApiIntervention> {
    const { data } = await api.post<ApiIntervention>('/interventions', payload);
    return data;
  },

  async update(
    id: string,
    payload: UpdateInterventionPayload,
  ): Promise<ApiIntervention> {
    const { data } = await api.patch<ApiIntervention>(
      `/interventions/${id}`,
      payload,
    );
    return data;
  },
};
