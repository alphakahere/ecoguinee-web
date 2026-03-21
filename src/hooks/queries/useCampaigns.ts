import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { campaignsService } from '@/services/campaigns';
import type { ApiCampaignFilters } from '@/types/api';

export function useCampaigns(filters?: ApiCampaignFilters) {
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
