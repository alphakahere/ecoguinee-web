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
import type { ApiReport, ReportStatus, ApiSeverity, OwnershipFilter } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAP_PAGE_SIZE = 200;

const OWNERSHIP_OPTIONS: { value: OwnershipFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'mine', label: 'Mes signalements' },
  { value: 'organization', label: 'Organisation' },
];

function OwnershipBadge({ report, currentUserId }: { report: ApiReport; currentUserId?: string }) {
  if (report.source !== 'AGENT') return null;
  const isOwn = report.agentId === currentUserId;
  return (
    <span
      className={cn(
        'text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0',
        isOwn
          ? 'bg-[#6FCF4A]/15 text-[#6FCF4A]'
          : 'bg-muted text-muted-foreground',
      )}
    >
      • {isOwn ? 'Moi' : (report.agent?.name ?? '—')}
    </span>
  );
}

export function SignalementsList() {
  const currentUser = useAuthStore((s) => s.user);
  const organizationId = currentUser?.memberOrganizationId;
  const assignReport = useAssignReport();

  const [view, setView] = useState<ViewMode>('table');
  const [ownership, setOwnership] = useState<OwnershipFilter>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    organizationId: organizationId || undefined,
    ownership,
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
  };

  const tableFilters = organizationId
    ? { ...filters, page, limit: pageSize }
    : undefined;
  const mapFilters = organizationId
    ? { ...filters, page: 1, limit: MAP_PAGE_SIZE }
    : undefined;

  const tableQuery = useReports(tableFilters, {
    enabled: !!organizationId && view === 'table',
  });
  const mapQuery = useReports(mapFilters, {
    enabled: !!organizationId && view === 'map',
  });

  const total = tableQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  function handleTakeCharge(r: ApiReport) {
    if (!currentUser || !organizationId) return;
    assignReport.mutate(
      { reportId: r.id, agentId: currentUser.id, organizationId },
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
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-mono">{name}</span>
            {r.source === 'CITIZEN' && r.contactPhone && (
              <span className="text-[10px] font-mono text-muted-foreground">{r.contactPhone}</span>
            )}
            <OwnershipBadge report={r} currentUserId={currentUser?.id} />
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

  // Desktop toolbar includes ownership dropdown
  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Adresse, zone…" className="w-full max-w-md" />
      <Select
        value={ownership}
        onChange={(e) => { setOwnership(e.target.value as OwnershipFilter); resetPage(); }}
        className="min-w-[170px] max-w-xs"
      >
        {OWNERSHIP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
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
      {/* Mobile ownership chips — above view mode tabs */}
      <div className="lg:hidden mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {OWNERSHIP_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { setOwnership(o.value); resetPage(); }}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-mono transition-colors',
                ownership === o.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-transparent text-muted-foreground hover:bg-muted',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewModeTabs value={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <>
          {/* Mobile cards */}
          <div className="lg:hidden">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="mb-5">
                {/* Mobile toolbar without ownership (handled by chips above) */}
                <div className="flex flex-col gap-3">
                  <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Adresse, zone…" className="w-full" />
                  <div className="flex gap-2">
                    <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="flex-1">
                      <option value="">Tous les statuts</option>
                      {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                    </Select>
                    <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }} className="flex-1">
                      <option value="">Toutes gravités</option>
                      {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                    </Select>
                  </div>
                </div>
              </div>
              {(tableQuery.isLoading || !organizationId) ? (
                <div className="flex justify-center py-10">
                  <span className="h-7 w-7 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
                </div>
              ) : tableQuery.isError ? (
                <p className="py-8 text-sm font-mono text-muted-foreground text-center">Impossible de charger les données.</p>
              ) : (tableQuery.data?.data ?? []).length === 0 ? (
                <p className="py-8 text-sm font-mono text-muted-foreground text-center">Aucun résultat</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {(tableQuery.data?.data ?? []).map((r) => {
                      const typeMeta = WASTE_TYPE_META[r.type];
                      const sevMeta = SEVERITY_META_API[r.severity];
                      const statusMeta = REPORT_STATUS_META[r.status];
                      const createdBy = r.source === 'AGENT' ? (r.agent?.name ?? '—') : (r.contactName ?? 'Citoyen');
                      return (
                        <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0 text-[10px]`}>{typeMeta.label}</Badge>
                              <Badge className={`${sevMeta.bg} ${sevMeta.color} border-0 text-[10px]`}>{sevMeta.label}</Badge>
                              <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0 text-[10px]`}>{statusMeta.label}</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <OwnershipBadge report={r} currentUserId={currentUser?.id} />
                              <span className="text-[10px] font-mono text-muted-foreground">{formatDate(r.createdAt)}</span>
                            </div>
                          </div>
                          {(r.zone?.name || r.address) && (
                            <p className="text-xs font-mono text-muted-foreground truncate">{r.zone?.name ?? r.address}</p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground truncate">{createdBy}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {r.status === 'REPORTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleTakeCharge(r)}
                                  disabled={assignReport.isPending}
                                  className="rounded-lg border border-primary px-2 py-1 text-[10px] font-mono text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
                                >
                                  Prendre en charge
                                </button>
                              )}
                              <Link href={`/agent/signalements/${r.id}`} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors">
                                Voir
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs font-mono text-muted-foreground">{total} résultat{total !== 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPage(page - 1)} disabled={!canPrev} className="rounded-lg px-2 py-1 text-xs font-mono border border-border hover:bg-muted disabled:opacity-50">←</button>
                        <span className="text-xs font-mono">{page} / {totalPages}</span>
                        <button type="button" onClick={() => setPage(page + 1)} disabled={!canNext} className="rounded-lg px-2 py-1 text-xs font-mono border border-border hover:bg-muted disabled:opacity-50">→</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
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
              isLoading={tableQuery.isLoading || !organizationId}
              isError={tableQuery.isError}
              getRowKey={(r) => r.id}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">{toolbar}</div>
          <ReportsMapView
            reports={mapQuery.data?.data ?? []}
            isLoading={mapQuery.isLoading || !organizationId}
          />
        </div>
      )}
    </div>
  );
}
