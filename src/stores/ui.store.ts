import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeFilters: Record<string, unknown>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setFilters: (key: string, filters: unknown) => void;
  resetFilters: (key: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  activeFilters: {},

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

  setFilters: (key, filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: filters },
    })),

  resetFilters: (key) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _removed, ...rest } = state.activeFilters;
      return { activeFilters: rest };
    }),
}));
