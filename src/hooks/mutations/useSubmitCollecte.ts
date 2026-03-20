import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';

export function useSubmitCollecte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { participants: number; notes?: string };
    }) => campaignsService.submitCollecte(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.detail(id),
      });
    },
  });
}
