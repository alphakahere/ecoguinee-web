'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useReports } from '@/hooks/queries/useReports';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import type { ApiReport, ReportStatus, ApiSeverity } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';

export default function SuperviseurSignalementsPage() {
  const { data: overview } = useSupervisorOverview();
  const smeId = overview?.pme.id;

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
    page,
    limit: pageSize,
  };

  const { data, isLoading, isError } = useReports(smeId ? filters : undefined);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const columns: Column<ApiReport>[] = [
    { key: 'type', label: 'Type', render: (r) => <Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>{WASTE_TYPE_META[r.type].label}</Badge> },
    { key: 'severity', label: 'Gravité', render: (r) => <Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>{SEVERITY_META_API[r.severity].label}</Badge> },
    { key: 'zone', label: 'Zone', render: (r) => <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span> },
    { key: 'source', label: 'Source', render: (r) => <span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span> },
    { key: 'status', label: 'Statut', render: (r) => <Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>{REPORT_STATUS_META[r.status].label}</Badge> },
    { key: 'date', label: 'Date', render: (r) => <span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Adresse, zone…" className="w-full max-w-md" />
      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[150px]">
        <option value="">Tous les statuts</option>
        {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
      <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }} className="min-w-[140px]">
        <option value="">Toutes gravités</option>
        {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader title="Signalements" description={`${total} signalement${total !== 1 ? 's' : ''} dans votre périmètre`} />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canPrev={canPrev}
        canNext={canNext}
        toolbar={toolbar}
        isLoading={isLoading || !smeId}
        isError={isError}
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
