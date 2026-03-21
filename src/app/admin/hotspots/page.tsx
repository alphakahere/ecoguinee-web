'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useReports } from '@/hooks/queries/useReports';
import { useDeleteReport } from '@/hooks/mutations/useDeleteReport';
import type { ApiReport, ReportStatus, ApiSeverity, ApiWasteType } from '@/types/api';
import {
  REPORT_STATUS_META,
  SEVERITY_META_API,
  WASTE_TYPE_META,
  REPORT_SOURCE_META,
} from '@/types/api';

const PAGE_SIZE = 15;

export default function AdminHotspotsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ReportStatus | undefined,
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
    type: (typeFilter || undefined) as ApiWasteType | undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useReports(filters);
  const reports = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Signalements</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total} signalement{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            placeholder="Adresse, zone, ID…"
            className="w-full max-w-md"
          />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px]">
            <option value="">Tous les statuts</option>
            {Object.entries(REPORT_STATUS_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
          <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }} className="min-w-[140px]">
            <option value="">Toutes gravités</option>
            {Object.entries(SEVERITY_META_API).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }} className="min-w-[130px]">
            <option value="">Tous types</option>
            {Object.entries(WASTE_TYPE_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          </div>
        ) : isError ? (
          <p className="py-8 text-sm font-mono text-muted-foreground">Impossible de charger les signalements.</p>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-background">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gravité</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zone</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Aucun résultat</TableCell>
                    </TableRow>
                  ) : reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link href={`/admin/hotspots/${r.id}`} className="font-mono text-xs text-primary hover:underline">
                          {r.id.slice(0, 8)}…
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>
                          {WASTE_TYPE_META[r.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>
                          {SEVERITY_META_API[r.severity].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>
                          {REPORT_STATUS_META[r.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/hotspots/${r.id}`}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            disabled={deleteReport.isPending}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-4 mt-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs">{page} / {totalPages}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
