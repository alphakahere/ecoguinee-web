export const queryKeys = {
  reports: {
    all: ['reports'] as const,
    filtered: (filters: object) => ['reports', 'list', filters] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
  },

  interventions: {
    all: ['interventions'] as const,
    filtered: (filters: object) =>
      ['interventions', 'list', filters] as const,
    detail: (id: string) => ['interventions', 'detail', id] as const,
  },

  campaigns: {
    all: ['campaigns'] as const,
    filtered: (filters: object) => ['campaigns', 'list', filters] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
  },

  zones: {
    all: ['zones'] as const,
    filtered: (filters: object) => ['zones', 'list', filters] as const,
    byType: (type: string) => ['zones', 'type', type] as const,
    detail: (id: string) => ['zones', 'detail', id] as const,
  },

  smes: {
    all: ['smes'] as const,
    filtered: (filters: object) => ['smes', 'list', filters] as const,
    detail: (id: string) => ['smes', 'detail', id] as const,
  },

  users: {
    all: ['users'] as const,
    filtered: (filters: object) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  stats: {
    dashboard: ['stats', 'dashboard'] as const,
    reports: ['stats', 'reports'] as const,
    campaigns: ['stats', 'campaigns'] as const,
  },
} as const;
