import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';
import type { CreateCampaignPayload } from '@/types/api';

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => campaignsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      qc.invalidateQueries({ queryKey: ['dashboard', 'supervisor-overview'] });
    },
  });
}
