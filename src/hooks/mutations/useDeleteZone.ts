import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { zonesService } from '@/services/zones';

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => zonesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.zones.all }),
  });
}
