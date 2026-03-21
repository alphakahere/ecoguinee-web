import { api } from './api';
import type {
  ApiCampaign,
  ApiCampaignFilters,
  ApiPaginatedResponse,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '@/types/api';

function normalize(
  data: ApiPaginatedResponse<ApiCampaign> | ApiCampaign[],
): ApiPaginatedResponse<ApiCampaign> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length };
  }
  return data;
}

export const campaignsService = {
  async getAll(filters?: ApiCampaignFilters): Promise<ApiPaginatedResponse<ApiCampaign>> {
    const { data } = await api.get<ApiPaginatedResponse<ApiCampaign> | ApiCampaign[]>(
      '/campaigns',
      { params: filters },
    );
    return normalize(data);
  },

  async getById(id: string): Promise<ApiCampaign> {
    const { data } = await api.get<ApiCampaign>(`/campaigns/${id}`);
    return data;
  },

  async create(payload: CreateCampaignPayload): Promise<ApiCampaign> {
    const { data } = await api.post<ApiCampaign>('/campaigns', payload);
    return data;
  },

  async update(id: string, payload: UpdateCampaignPayload): Promise<ApiCampaign> {
    const { data } = await api.patch<ApiCampaign>(`/campaigns/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },
};
