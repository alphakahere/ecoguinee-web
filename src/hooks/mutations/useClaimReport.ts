import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';

export interface ClaimReportInput {
  reportId: string;
  notes?: string;
}

export function useClaimReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClaimReportInput) =>
      interventionsService.create({
        reportId: payload.reportId,
        status: 'ASSIGNED',
        notes: payload.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.available });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.interventions.all });
    },
  });
}
