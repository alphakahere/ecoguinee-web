import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import type { ApiReportFilters } from '@/types/api';

export function useReports(
  filters?: ApiReportFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: filters
      ? queryKeys.reports.filtered(filters)
      : queryKeys.reports.all,
    queryFn: () => reportsService.getAll(filters),
    enabled: options?.enabled !== false,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
  });
}
