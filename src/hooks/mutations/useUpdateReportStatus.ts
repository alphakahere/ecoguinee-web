import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import type { Report } from '@/types';

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Report['status'] }) =>
      reportsService.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(id) });
    },
  });
}
