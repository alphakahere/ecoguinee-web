import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';

export function useAssignReportOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, organizationId }: { reportId: string; organizationId: string }) =>
      reportsService.assignOrganization(reportId, organizationId),
    onSuccess: (_data, { reportId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.reports.all });
      qc.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      qc.invalidateQueries({ queryKey: queryKeys.reports.available });
    },
  });
}
