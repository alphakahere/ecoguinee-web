import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface PublicReportPayload {
  type: string;
  severity: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  contactName?: string;
  contactPhone?: string;
  photos?: string[];
}

export function useCreatePublicReport() {
  return useMutation({
    mutationFn: async (payload: PublicReportPayload) => {
      const { data } = await api.post('/reports/public', payload);
      return data;
    },
  });
}
