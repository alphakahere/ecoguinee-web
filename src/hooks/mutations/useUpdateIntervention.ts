import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';
import type { Intervention } from '@/types';

export function useUpdateIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Intervention>;
    }) => interventionsService.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.detail(id),
      });
    },
  });
}
