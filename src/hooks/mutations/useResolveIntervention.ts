import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';

export interface ResolveInterventionInput {
  id: string;
  pvDocument: string;
  resolutionNote?: string;
}

export function useResolveIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: ResolveInterventionInput) =>
      interventionsService.resolve(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interventions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.interventions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
