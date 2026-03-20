import { api } from './api';
import type { Report, ReportFilters, PaginatedResponse, PendingReport } from '@/types';

export const reportsService = {
  async getAll(filters?: ReportFilters): Promise<PaginatedResponse<Report>> {
    const { data } = await api.get<PaginatedResponse<Report>>('/reports', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Report> {
    const { data } = await api.get<Report>(`/reports/${id}`);
    return data;
  },

  async create(
    payload: Omit<PendingReport, 'localId'>,
  ): Promise<Report> {
    const { data } = await api.post<Report>('/reports', payload);
    return data;
  },

  async update(id: string, payload: Partial<Report>): Promise<Report> {
    const { data } = await api.patch<Report>(`/reports/${id}`, payload);
    return data;
  },

  async updateStatus(
    id: string,
    status: Report['status'],
  ): Promise<Report> {
    const { data } = await api.patch<Report>(`/reports/${id}/status`, {
      status,
    });
    return data;
  },
};
