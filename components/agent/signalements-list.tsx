'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { ViewModeTabs, type ViewMode } from '@/components/shared/view-mode-tabs';
import { ReportsMapView } from '@/components/maps/reports-map-view';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useReports } from '@/hooks/queries/useReports';
import { useAuthStore } from '@/stores/auth.store';
import { useAssignReport } from '@/hooks/mutations/useAssignReport';
import type { ApiReport, ReportStatus, ApiSeverity } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';
import { toast } from 'sonner';

const MAP_PAGE_SIZE = 200;

export function SignalementsList() {
  const currentUser = useAuthStore((s) => s.user);
  const smeId = currentUser?.memberSmeId;
  const assignReport = useAssignReport();

  const [view, setView] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    smeId: smeId || undefined,
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
  };

  const tableFilters = smeId
    ? { ...filters, page, limit: pageSize }
    : undefined;
  const mapFilters = smeId
    ? { ...filters, page: 1, limit: MAP_PAGE_SIZE }
    : undefined;

  const tableQuery = useReports(tableFilters, {
    enabled: !!smeId && view === 'table',
  });
  const mapQuery = useReports(mapFilters, {
    enabled: !!smeId && view === 'map',
  });

  const total = tableQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  function handleTakeCharge(r: ApiReport) {
    if (!currentUser || !smeId) return;
    assignReport.mutate(
      { reportId: r.id, agentId: currentUser.id, smeId },
      {
        onSuccess: () => toast.success('Signalement pris en charge'),
        onError: () => toast.error('Erreur lors de la prise en charge'),
      },
    );
  }

  const columns: Column<ApiReport>[] = [
    { key: 'type', label: 'Type', render: (r) => <Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>{WASTE_TYPE_META[r.type].label}</Badge> },
    { key: 'severity', label: 'Gravité', render: (r) => <Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>{SEVERITY_META_API[r.severity].label}</Badge> },
    { key: 'zone', label: 'Zone', render: (r) => <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span> },
    { key: 'source', label: 'Source', render: (r) => <span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span> },
    {
      key: 'createdBy', label: 'Créé par',
      render: (r) => {
        const name = r.source === 'AGENT' ? (r.agent?.name ?? '—') : (r.contactName ?? 'Citoyen');
        return (
          <div className="flex flex-col">
            <span className="text-xs font-mono">{name}</span>
            {r.source === 'CITIZEN' && r.contactPhone && (
              <span className="text-[10px] font-mono text-muted-foreground">{r.contactPhone}</span>
            )}
          </div>
        );
      },
    },
    { key: 'status', label: 'Statut', render: (r) => <Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>{REPORT_STATUS_META[r.status].label}</Badge> },
    { key: 'date', label: 'Date', render: (r) => <span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.status === 'REPORTED' && (
            <button
              type="button"
              onClick={() => handleTakeCharge(r)}
              disabled={assignReport.isPending}
              className="rounded-lg border border-primary px-2.5 py-1 text-[10px] font-mono text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
            >
              Prendre en charge
            </button>
          )}
          <Link
            href={`/agent/signalements/${r.id}`}
            className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors"
          >
            Voir
          </Link>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Adresse, zone…" className="w-full max-w-md" />
      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[150px] max-w-xs">
        <option value="">Tous les statuts</option>
        {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
      <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }} className="min-w-[140px] max-w-xs">
        <option value="">Toutes gravités</option>
        {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewModeTabs value={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <DataTable
          data={tableQuery.data?.data ?? []}
          columns={columns}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          canPrev={canPrev}
          canNext={canNext}
          toolbar={toolbar}
          isLoading={tableQuery.isLoading || !smeId}
          isError={tableQuery.isError}
          getRowKey={(r) => r.id}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">{toolbar}</div>
          <ReportsMapView
            reports={mapQuery.data?.data ?? []}
            isLoading={mapQuery.isLoading || !smeId}
          />
        </div>
      )}
    </div>
  );
}
