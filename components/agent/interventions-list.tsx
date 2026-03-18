'use client';

import { hotspots } from '@/lib/data/mock-data';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { formatDate } from '@/lib/utils';
import type { Hotspot } from '@/lib/types';

const MY_INTERVENTIONS = hotspots.filter((h) => h.assignedTo !== undefined);

const columns = [
  { key: 'id', label: 'ID', render: (h: Hotspot) => <span className="text-xs font-mono text-muted-foreground">{h.id}</span> },
  { key: 'severity', label: 'Gravité', render: (h: Hotspot) => <SeverityBadge severity={h.severity} /> },
  { key: 'sector', label: 'Secteur', render: (h: Hotspot) => <span className="text-sm font-mono">{h.location.sector}</span> },
  { key: 'address', label: 'Adresse', render: (h: Hotspot) => <span className="text-sm font-mono truncate max-w-[160px] block">{h.location.address}</span> },
  { key: 'assignedTo', label: 'Assigné à', render: (h: Hotspot) => <span className="text-sm font-mono">{h.assignedTo}</span> },
  { key: 'status', label: 'Statut', render: (h: Hotspot) => <StatusBadge status={h.status} /> },
  { key: 'reportedAt', label: 'Date', render: (h: Hotspot) => <span className="text-xs font-mono text-muted-foreground">{formatDate(h.reportedAt, { day: '2-digit', month: 'short', year: undefined })}</span> },
];

const filters = [
  { key: 'status', label: 'Statut', options: [
    { value: 'reported', label: 'Signalé' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'resolved', label: 'Résolu' },
  ]},
];

export function InterventionsList() {
  return (
    <DataTable
      data={MY_INTERVENTIONS}
      columns={columns}
      filters={filters}
      searchPlaceholder="Rechercher une intervention..."
      getSearchValue={(h) => `${h.id} ${h.location.address} ${h.location.sector} ${h.assignedTo ?? ''}`}
    />
  );
}
