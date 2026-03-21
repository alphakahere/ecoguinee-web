import { api } from './api';

export interface PublicStats {
  totalReports: number;
  resolvedReports: number;
  activeSmes: number;
  totalCampaigns: number;
  communes: number;
}

export const publicStatsService = {
  async get(): Promise<PublicStats> {
    const { data } = await api.get<PublicStats>('/dashboard/public-stats');
    return data;
  },
};
