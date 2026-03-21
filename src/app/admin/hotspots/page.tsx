'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagination } from '@/hooks/usePagination';
import { useReports } from '@/hooks/queries/useReports';
import { useDeleteReport } from '@/hooks/mutations/useDeleteReport';
import type { ApiReport, ReportStatus, ApiSeverity, ApiWasteType } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';

export default function AdminHotspotsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filters = {
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
    type: (typeFilter || undefined) as ApiWasteType | undefined,
    page: 1,
    limit: 15,
  };

  const { data, isLoading, isError } = useReports(filters);
  const total = data?.total ?? 0;
  const pagination = usePagination(total, { pageSize: 15 });
  filters.page = pagination.page;

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

  const resetFilters = () => {
    setSearch(''); setStatusFilter(''); setSeverityFilter(''); setTypeFilter('');
    pagination.reset();
  };

  const columns: Column<ApiReport>[] = [
    { key: 'id', label: 'ID', render: (r) => <Link href={`/admin/hotspots/${r.id}`} className="font-mono text-xs text-primary hover:underline">{r.id.slice(0, 8)}…</Link> },
    { key: 'type', label: 'Type', render: (r) => <Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>{WASTE_TYPE_META[r.type].label}</Badge> },
    { key: 'severity', label: 'Gravité', render: (r) => <Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>{SEVERITY_META_API[r.severity].label}</Badge> },
    { key: 'zone', label: 'Zone', render: (r) => <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span> },
    { key: 'source', label: 'Source', render: (r) => <span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span> },
    { key: 'status', label: 'Statut', render: (r) => <Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>{REPORT_STATUS_META[r.status].label}</Badge> },
    { key: 'date', label: 'Date', render: (r) => <span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions', label: '', headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/hotspots/${r.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></Link>
          <button type="button" onClick={() => handleDelete(r)} disabled={deleteReport.isPending} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Signalements</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} signalement{total !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); pagination.reset(); }} placeholder="Adresse, zone, ID…" className="w-full max-w-md" />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pagination.reset(); }} className="min-w-[160px]">
          <option value="">Tous les statuts</option>
          {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); pagination.reset(); }} className="min-w-[140px]">
          <option value="">Toutes gravités</option>
          {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); pagination.reset(); }} className="min-w-[130px]">
          <option value="">Tous types</option>
          {Object.entries(WASTE_TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
      </div>
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
      isLoading={isLoading}
      isError={isError}
      getRowKey={(r) => r.id}
    />
  );
}
