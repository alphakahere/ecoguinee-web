import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { zonesService } from '@/services/zones';

export function useZones(type?: string) {
  return useQuery({
    queryKey: type ? queryKeys.zones.byType(type) : queryKeys.zones.all,
    queryFn: () => (type ? zonesService.getByType(type) : zonesService.getAll()),
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
