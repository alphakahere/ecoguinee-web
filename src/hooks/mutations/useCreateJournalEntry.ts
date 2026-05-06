'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  interventionJournalService,
  type CreateJournalEntryPayload,
} from '@/services/intervention-journal';

export interface CreateJournalEntryInput extends CreateJournalEntryPayload {
  interventionId: string;
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interventionId, ...payload }: CreateJournalEntryInput) =>
      interventionJournalService.create(interventionId, payload),
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
