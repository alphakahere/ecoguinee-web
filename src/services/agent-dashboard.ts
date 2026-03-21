import { api } from './api';

export interface AgentOverview {
  sme: {
    id: string;
    name: string;
    zones: { id: string; name: string }[];
  };
  counts: {
    reports: number;
    myInterventions: number;
    myResolved: number;
    campaigns: number;
  };
  resolutionRate: number;
  recentReports: {
    id: string;
    severity: string;
    status: string;
    address?: string | null;
    zone?: { id: string; name: string } | null;
    createdAt: string;
  }[];
  myAssigned: {
    id: string;
    status: string;
    reportId: string;
    address?: string | null;
    severity: string;
    smeName?: string | null;
    createdAt: string;
  }[];
}

export const agentDashboardService = {
  async getOverview(): Promise<AgentOverview> {
    const { data } = await api.get<AgentOverview>('/dashboard/agent-overview');
    return data;
  },
};
