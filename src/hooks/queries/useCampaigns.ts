import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';
import type { CampaignFilters } from '@/types';

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: filters
      ? queryKeys.campaigns.filtered(filters)
      : queryKeys.campaigns.all,
    queryFn: () => campaignsService.getAll(filters),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignsService.getById(id),
    enabled: !!id,
  });
}
