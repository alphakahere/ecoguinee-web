'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useReports } from '@/hooks/queries/useReports';
import { useDeleteReport } from '@/hooks/mutations/useDeleteReport';
import type { ApiReport } from '@/types/api';
import {
  REPORT_STATUS_META,
  SEVERITY_META_API,
  WASTE_TYPE_META,
  REPORT_SOURCE_META,
} from '@/types/api';

export default function AdminHotspotsPage() {
  const { data, isLoading, isError } = useReports({ page: 1, limit: 200 });
  const reportsList = data?.data ?? [];
  const deleteReport = useDeleteReport();

  const handleDelete = async (r: ApiReport) => {
    if (!window.confirm(`Supprimer le signalement ${r.id.slice(0, 8)}… ?`)) return;
    try {
      await deleteReport.mutateAsync(r.id);
      toast.success('Signalement supprimé');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (r: ApiReport) => {
        const m = WASTE_TYPE_META[r.type];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'severity',
      label: 'Gravité',
      render: (r: ApiReport) => {
        const m = SEVERITY_META_API[r.severity];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'zone',
      label: 'Zone',
      render: (r: ApiReport) => (
        <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (r: ApiReport) => (
        <span className="text-xs font-mono text-muted-foreground">
          {REPORT_SOURCE_META[r.source].label}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (r: ApiReport) => {
        const m = REPORT_STATUS_META[r.status];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r: ApiReport) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r: ApiReport) => (
        <button
          type="button"
          onClick={() => handleDelete(r)}
          disabled={deleteReport.isPending}
          className="text-xs font-mono text-[#D94035] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Statut',
      options: Object.entries(REPORT_STATUS_META).map(([v, m]) => ({ value: v, label: m.label })),
    },
    {
      key: 'severity',
      label: 'Gravité',
      options: Object.entries(SEVERITY_META_API).map(([v, m]) => ({ value: v, label: m.label })),
    },
    {
      key: 'type',
      label: 'Type',
      options: Object.entries(WASTE_TYPE_META).map(([v, m]) => ({ value: v, label: m.label })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Signalements"
        description={
          isLoading
            ? 'Chargement…'
            : isError
              ? 'Erreur de chargement'
              : `${reportsList.length} signalements`
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">
          Impossible de charger les signalements.
        </p>
      ) : (
        <DataTable
          data={reportsList}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher un signalement..."
          getSearchValue={(r) =>
            `${r.id} ${r.address ?? ''} ${r.zone?.name ?? ''} ${r.description ?? ''}`
          }
        />
      )}
    </div>
  );
}
