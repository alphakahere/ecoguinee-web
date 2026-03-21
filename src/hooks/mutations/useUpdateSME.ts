import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { smesService } from '@/services/smes';
import type { UpdateSMEPayload } from '@/types/api';

export function useUpdateSME() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSMEPayload }) =>
      smesService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.smes.all });
      qc.invalidateQueries({ queryKey: queryKeys.smes.detail(id) });
    },
  });
}
