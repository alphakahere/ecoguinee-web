import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { smesService } from '@/services/smes';

export function useDeleteSME() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smes.all }),
  });
}
