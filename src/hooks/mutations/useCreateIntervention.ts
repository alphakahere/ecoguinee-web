import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';
import type { Intervention } from '@/types';

export function useCreateIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Intervention, 'id'> & { reportId: string }) =>
      interventionsService.create(payload),
    onSuccess: (_data, { reportId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.detail(reportId),
      });
    },
  });
}
