import { api } from './api';

export interface DashboardOverview {
  counts: {
    reports: number;
    resolvedReports: number;
    interventions: number;
    campaigns: number;
    smes: number;
    users: number;
  };
  resolutionRate: number;
  roleDistribution: { role: string; count: number }[];
  recentReports: {
    id: string;
    severity: string;
    status: string;
    address?: string | null;
    zone?: { id: string; name: string } | null;
    createdAt: string;
  }[];
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>('/dashboard/overview');
    return data;
  },
};
