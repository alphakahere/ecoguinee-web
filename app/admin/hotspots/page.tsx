'use client';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { hotspots } from '@/lib/data/mock-data';
import { StatusBadge } from '@/components/shared/status-badge';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { WasteTypeBadge } from '@/components/shared/waste-type-badge';
import { formatDate } from '@/lib/utils';
import type { Hotspot } from '@/lib/types';

const columns = [
  { key: 'id', label: 'ID', render: (h: Hotspot) => <span className="text-xs font-mono text-muted-foreground">{h.id}</span> },
  { key: 'wasteType', label: 'Type', render: (h: Hotspot) => <WasteTypeBadge type={h.wasteType} /> },
  { key: 'severity', label: 'Gravité', render: (h: Hotspot) => <SeverityBadge severity={h.severity} /> },
  { key: 'territoire', label: 'Territoire', render: (h: Hotspot) => <span className="text-sm font-mono">{h.location.territoire}</span> },
  { key: 'sector', label: 'Secteur', render: (h: Hotspot) => <span className="text-sm font-mono">{h.location.sector}</span> },
  { key: 'reportedBy', label: 'Signalé par', render: (h: Hotspot) => <span className="text-xs font-mono">{h.reportedBy}</span> },
  { key: 'status', label: 'Statut', render: (h: Hotspot) => <StatusBadge status={h.status} /> },
  { key: 'reportedAt', label: 'Date', render: (h: Hotspot) => <span className="text-xs font-mono text-muted-foreground">{formatDate(h.reportedAt, { day: '2-digit', month: 'short', year: undefined })}</span> },
];

const filters = [
  { key: 'status', label: 'Statut', options: [{ value: 'reported', label: 'Signalé' }, { value: 'in-progress', label: 'En cours' }, { value: 'resolved', label: 'Résolu' }] },
  { key: 'severity', label: 'Gravité', options: [{ value: 'critical', label: 'Critique' }, { value: 'high', label: 'Élevé' }, { value: 'medium', label: 'Moyen' }, { value: 'low', label: 'Faible' }] },
];

export default function AdminHotspotsPage() {
  return (
    <div className="max-w-6xl">
      <PageHeader title="Signalements" description={`${hotspots.length} signalements enregistrés`} />
      <DataTable
        data={hotspots}
        columns={columns}
        filters={filters}
        searchPlaceholder="Rechercher un signalement..."
        getSearchValue={(h) => `${h.id} ${h.location.address} ${h.location.territoire} ${h.location.sector} ${h.reportedBy}`}
      />
    </div>
  );
}
