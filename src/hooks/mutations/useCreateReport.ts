import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { api } from '@/services/api';
import type { ApiReport } from '@/types/api';

interface CreateReportPayload {
  type: string;
  severity: string;
  source: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  agentId?: string;
  contactName?: string;
  contactPhone?: string;
  photos?: string[];
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReportPayload) => {
      const { data } = await api.post<ApiReport>('/reports', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reports.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
