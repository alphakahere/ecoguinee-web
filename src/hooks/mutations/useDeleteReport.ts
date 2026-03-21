import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reports.all }),
  });
}
