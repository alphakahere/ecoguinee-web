import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { zonesService } from '@/services/zones';
import type { ZoneFilters } from '@/types/api';

export function useZones(filters?: ZoneFilters) {
  return useQuery({
    queryKey: filters ? queryKeys.zones.filtered(filters) : queryKeys.zones.all,
    queryFn: () => zonesService.getAll(filters),
  });
}

export function useZone(id: string) {
  return useQuery({
    queryKey: queryKeys.zones.detail(id),
    queryFn: () => zonesService.getById(id),
    enabled: !!id,
  });
}

export function useZoneChildren(parentId: string) {
  return useQuery({
    queryKey: [...queryKeys.zones.detail(parentId), 'children'] as const,
    queryFn: () => zonesService.getChildren(parentId),
    enabled: !!parentId,
  });
}
