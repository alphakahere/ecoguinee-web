'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagination } from '@/hooks/usePagination';
import { useReports } from '@/hooks/queries/useReports';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiReport, ReportStatus, ApiSeverity } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';

export function SignalementsList() {
  const currentUser = useAuthStore((s) => s.user);
  const smeId = currentUser?.memberSmeId;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filters = {
    smeId: smeId || undefined,
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
    page: 1,
    limit: 15,
  };

  const { data, isLoading } = useReports(smeId ? filters : undefined);
  const total = data?.total ?? 0;
  const pagination = usePagination(total);
  if (smeId) filters.page = pagination.page;

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
      <SearchInput value={search} onChange={(v) => { setSearch(v); pagination.reset(); }} placeholder="Adresse, zone…" className="w-full max-w-md" />
      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pagination.reset(); }} className="min-w-[150px]">
        <option value="">Tous les statuts</option>
        {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
      <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); pagination.reset(); }} className="min-w-[140px]">
        <option value="">Toutes gravités</option>
        {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      total={total}
      page={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={pagination.setPage}
      canPrev={pagination.canPrev}
      canNext={pagination.canNext}
      toolbar={toolbar}
      isLoading={isLoading || !smeId}
      getRowKey={(r) => r.id}
    />
  );
}
