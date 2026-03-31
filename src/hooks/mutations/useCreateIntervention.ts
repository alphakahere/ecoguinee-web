import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';

/** Champs attendus par l’API pour créer une intervention */
export type CreateInterventionInput = Pick<
  ApiIntervention,
  'reportId' | 'agentId' | 'smeId'
> & {
  notes?: string | null;
  status?: ApiInterventionStatus;
};

export function useCreateIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInterventionInput) =>
      interventionsService.create({
        ...payload,
        status: payload.status ?? 'ASSIGNED',
        notes: payload.notes ?? undefined,
      }),
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
