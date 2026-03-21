import { useQuery } from '@tanstack/react-query';
import { supervisorDashboardService } from '@/services/supervisor-dashboard';

export function useSupervisorOverview() {
  return useQuery({
    queryKey: ['dashboard', 'supervisor-overview'],
    queryFn: () => supervisorDashboardService.getOverview(),
  });
}
