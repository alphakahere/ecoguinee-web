'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useReports } from '@/hooks/queries/useReports';
import { useAuthStore } from '@/stores/auth.store';
import type { ReportStatus, ApiSeverity } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';

const PAGE_SIZE = 15;

export function SignalementsList() {
  const currentUser = useAuthStore((s) => s.user);
  const smeId = currentUser?.memberSmeId;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    smeId: smeId || undefined,
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useReports(smeId ? filters : undefined);
  const reports = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetPage = () => setPage(1);

  if (isLoading || !smeId) {
    return <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" /></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3 mb-4">
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

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-background">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gravité</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zone</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Aucun résultat</TableCell></TableRow>
            ) : reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell><Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>{WASTE_TYPE_META[r.type].label}</Badge></TableCell>
                <TableCell><Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>{SEVERITY_META_API[r.severity].label}</Badge></TableCell>
                <TableCell><span className="text-sm font-mono">{r.zone?.name ?? '—'}</span></TableCell>
                <TableCell><span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span></TableCell>
                <TableCell><Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>{REPORT_STATUS_META[r.status].label}</Badge></TableCell>
                <TableCell><span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-mono text-xs">{page} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
