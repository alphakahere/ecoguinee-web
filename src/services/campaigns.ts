import { api } from './api';
import type { Campaign, CampaignFilters, PaginatedResponse } from '@/types';

export const campaignsService = {
  async getAll(
    filters?: CampaignFilters,
  ): Promise<PaginatedResponse<Campaign>> {
    const { data } = await api.get<PaginatedResponse<Campaign>>('/campaigns', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Campaign> {
    const { data } = await api.get<Campaign>(`/campaigns/${id}`);
    return data;
  },

  async create(payload: Omit<Campaign, 'id'>): Promise<Campaign> {
    const { data } = await api.post<Campaign>('/campaigns', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<Campaign>,
  ): Promise<Campaign> {
    const { data } = await api.patch<Campaign>(`/campaigns/${id}`, payload);
    return data;
  },

  async submitCollecte(
    id: string,
    payload: { participants: number; notes?: string },
  ): Promise<Campaign> {
    const { data } = await api.post<Campaign>(
      `/campaigns/${id}/collecte`,
      payload,
    );
    return data;
  },
};
