import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionsService } from '@/services/interventions';
import type { InterventionFilters } from '@/types';

export function useInterventions(
  filters?: InterventionFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: filters
      ? queryKeys.interventions.filtered(filters)
      : queryKeys.interventions.all,
    queryFn: () => interventionsService.getAll(filters),
    enabled: options?.enabled !== false,
  });
}

export function useIntervention(id: string) {
  return useQuery({
    queryKey: queryKeys.interventions.detail(id),
    queryFn: () => interventionsService.getById(id),
    enabled: !!id,
  });
}
