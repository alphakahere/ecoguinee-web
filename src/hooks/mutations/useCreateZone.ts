import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { zonesService } from '@/services/zones';
import type { CreateZonePayload } from '@/types/api';

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateZonePayload) => zonesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.zones.all }),
  });
}
