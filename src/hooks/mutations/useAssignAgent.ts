import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';

export function useAssignAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      interventionsService.assignAgent(id, agentId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interventions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.interventions.all });
    },
  });
}
