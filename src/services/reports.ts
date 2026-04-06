import { api } from './api';
import type {
  ApiReport,
  ApiReportFilters,
  ApiPaginatedResponse,
} from '@/types/api';

function normalize(
  data: ApiPaginatedResponse<ApiReport> | ApiReport[],
): ApiPaginatedResponse<ApiReport> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length };
  }
  return data;
}

export const reportsService = {
	async getAll(
		filters?: ApiReportFilters,
	): Promise<ApiPaginatedResponse<ApiReport>> {
		const { data } = await api.get<
			ApiPaginatedResponse<ApiReport> | ApiReport[]
		>("/reports", { params: filters });
		return normalize(data);
	},

	async getById(id: string): Promise<ApiReport> {
		const { data } = await api.get<ApiReport>(`/reports/${id}`);
		return data;
	},

	async getAvailable(): Promise<ApiPaginatedResponse<ApiReport>> {
		const { data } = await api.get<
			ApiPaginatedResponse<ApiReport> | ApiReport[]
		>("/reports/available");
		return normalize(data);
	},

	async delete(id: string): Promise<void> {
		await api.delete(`/reports/${id}`);
	},

	async assignOrganization(
		id: string,
		organizationId: string,
	): Promise<ApiReport> {
		const { data } = await api.patch<ApiReport>(
			`/reports/${id}/assign-organization`,
			{
				organizationId,
			},
		);
		return data;
	},
};
