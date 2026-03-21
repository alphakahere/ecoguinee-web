import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { dashboardService } from '@/services/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: () => dashboardService.getOverview(),
  });
}
