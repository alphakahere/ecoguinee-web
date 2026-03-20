import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';
import type { Campaign } from '@/types';

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Campaign>;
    }) => campaignsService.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.detail(id),
      });
    },
  });
}
