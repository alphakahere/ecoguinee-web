import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      qc.invalidateQueries({ queryKey: ['dashboard', 'supervisor-overview'] });
    },
  });
}
