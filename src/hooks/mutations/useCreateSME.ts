import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { smesService } from '@/services/smes';
import type { CreateSMEPayload } from '@/types/api';

export function useCreateSME() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSMEPayload) => smesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.smes.all }),
  });
}
