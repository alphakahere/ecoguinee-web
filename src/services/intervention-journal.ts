import { api } from './api';
import type { InterventionJournalEntry } from '@/types/api';

export interface CreateJournalEntryPayload {
  note: string;
  entryDate: string;
  photos?: string[];
}

export interface UpdateJournalEntryPayload {
  note?: string;
  entryDate?: string;
  photos?: string[];
}

export const interventionJournalService = {
  async list(interventionId: string): Promise<InterventionJournalEntry[]> {
    const { data } = await api.get<InterventionJournalEntry[]>(
      `/interventions/${interventionId}/journal`,
    );
    return data;
  },

  async create(
    interventionId: string,
    payload: CreateJournalEntryPayload,
  ): Promise<InterventionJournalEntry> {
    const { data } = await api.post<InterventionJournalEntry>(
      `/interventions/${interventionId}/journal`,
      payload,
    );
    return data;
  },

  async update(
    interventionId: string,
    entryId: string,
    payload: UpdateJournalEntryPayload,
  ): Promise<InterventionJournalEntry> {
    const { data } = await api.patch<InterventionJournalEntry>(
      `/interventions/${interventionId}/journal/${entryId}`,
      payload,
    );
    return data;
  },

  async remove(interventionId: string, entryId: string): Promise<void> {
    await api.delete(`/interventions/${interventionId}/journal/${entryId}`);
  },
};
