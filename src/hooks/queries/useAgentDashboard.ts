import { useQuery } from '@tanstack/react-query';
import { agentDashboardService } from '@/services/agent-dashboard';

export function useAgentOverview() {
  return useQuery({
    queryKey: ['dashboard', 'agent-overview'],
    queryFn: () => agentDashboardService.getOverview(),
  });
}
