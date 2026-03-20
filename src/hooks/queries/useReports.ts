import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import type { ReportFilters } from '@/types';

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: filters
      ? queryKeys.reports.filtered(filters)
      : queryKeys.reports.all,
    queryFn: () => reportsService.getAll(filters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
  });
}
