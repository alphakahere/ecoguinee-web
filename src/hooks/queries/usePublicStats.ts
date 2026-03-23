import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { publicStatsService } from '@/services/public-stats';

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: () => publicStatsService.get(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
