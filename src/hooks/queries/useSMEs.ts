import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { smesService } from '@/services/smes';
import type { SMEFilters } from '@/types/api';

export function useSMEs(filters?: SMEFilters) {
  return useQuery({
    queryKey: filters ? queryKeys.smes.filtered(filters) : queryKeys.smes.all,
    queryFn: () => smesService.getAll(filters),
  });
}

export function useSME(id: string) {
  return useQuery({
    queryKey: queryKeys.smes.detail(id),
    queryFn: () => smesService.getById(id),
    enabled: !!id,
  });
}
