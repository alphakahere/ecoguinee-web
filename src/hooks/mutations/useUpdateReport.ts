import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import type { Report } from '@/types';

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Report> }) =>
      reportsService.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(id) });
    },
  });
}
