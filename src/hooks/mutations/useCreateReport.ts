import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import type { PendingReport } from '@/types';

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<PendingReport, 'localId'>) =>
      reportsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
