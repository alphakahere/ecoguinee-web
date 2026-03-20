import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PendingReport } from '@/types';

interface OfflineState {
  queue: PendingReport[];
  isSyncing: boolean;
  addToQueue: (report: PendingReport) => void;
  removeFromQueue: (localId: string) => void;
  syncQueue: () => Promise<void>;
  setIsSyncing: (value: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      addToQueue: (report) =>
        set((state) => ({ queue: [...state.queue, report] })),

      removeFromQueue: (localId) =>
        set((state) => ({
          queue: state.queue.filter((r) => r.localId !== localId),
        })),

      syncQueue: async () => {
        const { queue, isSyncing } = get();
        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });
        try {
          const { reportsService } = await import('@/services/reports');
          for (const report of queue) {
            await reportsService.create(report);
            set((state) => ({
              queue: state.queue.filter((r) => r.localId !== report.localId),
            }));
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      setIsSyncing: (value) => set({ isSyncing: value }),
    }),
    {
      name: 'eco-offline-queue',
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);
