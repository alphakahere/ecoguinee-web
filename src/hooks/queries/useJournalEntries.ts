'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionJournalService } from '@/services/intervention-journal';

export function useJournalEntries(
  interventionId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.interventions.journal(interventionId ?? ''),
    queryFn: () => interventionJournalService.list(interventionId as string),
    enabled: !!interventionId && options?.enabled !== false,
  });
}
