import { api } from './api';

export interface SupervisorOverview {
  pme: {
    id: string;
    name: string;
    zones: { id: string; name: string }[];
  };
  counts: {
    reports: number;
    resolvedReports: number;
    interventions: number;
    resolvedInterventions: number;
    campaigns: number;
    agents: number;
  };
  resolutionRate: number;
  interventionsByStatus: {
    ASSIGNED: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    FAILED: number;
  };
  recentReports: {
    id: string;
    severity: string;
    status: string;
    address?: string | null;
    zone?: { id: string; name: string } | null;
    createdAt: string;
  }[];
  agents: {
    id: string;
    name: string;
    status: string;
    lastLogin: string | null;
    interventionCount: number;
    resolvedCount: number;
  }[];
}

export const supervisorDashboardService = {
  async getOverview(): Promise<SupervisorOverview> {
    const { data } = await api.get<SupervisorOverview>('/dashboard/supervisor-overview');
    return data;
  },
};
