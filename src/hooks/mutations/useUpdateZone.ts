import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { zonesService } from '@/services/zones';
import type { UpdateZonePayload } from '@/types/api';

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateZonePayload }) =>
      zonesService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.zones.all });
      qc.invalidateQueries({ queryKey: queryKeys.zones.detail(id) });
    },
  });
}
