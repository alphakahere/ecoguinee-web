import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';

interface TakeChargePayload {
  reportId: string;
  agentId: string;
  organizationId: string;
}

export function useAssignReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, agentId, organizationId }: TakeChargePayload) =>
      interventionsService.create({
        reportId,
        agentId,
        organizationId,
        assignedDate: new Date().toISOString(),
      } as never),
    onSuccess: (_data, { reportId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.reports.all });
      qc.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      qc.invalidateQueries({ queryKey: queryKeys.interventions.all });
    },
  });
}
