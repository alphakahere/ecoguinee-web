'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  interventionJournalService,
  type UpdateJournalEntryPayload,
} from '@/services/intervention-journal';

export interface UpdateJournalEntryInput extends UpdateJournalEntryPayload {
  interventionId: string;
  entryId: string;
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      interventionId,
      entryId,
      ...payload
    }: UpdateJournalEntryInput) =>
      interventionJournalService.update(interventionId, entryId, payload),
    onSuccess: (_data, { interventionId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interventions.journal(interventionId),
      });
    },
  });
}
