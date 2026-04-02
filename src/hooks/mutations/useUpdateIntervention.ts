import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';
import type { ApiInterventionStatus } from '@/types/api';

export interface UpdateInterventionPayload {
  status?: ApiInterventionStatus;
  notes?: string;
  resolutionDate?: string;
  pvDocument?: string;
  resolutionNote?: string;
  photos?: string[];
}

export function useUpdateIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInterventionPayload;
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
