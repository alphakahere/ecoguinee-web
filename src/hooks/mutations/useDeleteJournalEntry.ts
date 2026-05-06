'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { interventionJournalService } from '@/services/intervention-journal';

export interface DeleteJournalEntryInput {
  interventionId: string;
  entryId: string;
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interventionId, entryId }: DeleteJournalEntryInput) =>
      interventionJournalService.remove(interventionId, entryId),
    onSuccess: (_data, { interventionId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.journal(interventionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.detail(interventionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.all,
      });
    },
  });
}
