import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';

export function useAvailableReports() {
  return useQuery({
    queryKey: queryKeys.reports.available,
    queryFn: () => reportsService.getAvailable(),
    refetchInterval: 30_000, // poll every 30s
  });
}
