'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { useSMEs } from '@/hooks/queries/useSMEs';
import type { ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META } from '@/types/api';
import { InterventionStatusModal } from '@/components/admin/intervention-status-modal';
import type { ApiIntervention } from '@/types/api';

const PAGE_SIZE = 15;

export default function AdminInterventionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [smeFilter, setSmeFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    status: statusFilter || undefined,
    smeId: smeFilter || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useInterventions(filters);
  const interventions = data?.data ?? (Array.isArray(data) ? data as ApiIntervention[] : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { data: smesData } = useSMEs({ page: 1, limit: 100 });
  const smes = smesData?.data ?? [];

  const updateIntervention = useUpdateIntervention();

  const [editIntervention, setEditIntervention] = useState<ApiIntervention | null>(null);

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } as never });
      toast.success('Statut mis à jour');
      setEditIntervention(null);
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="pt-5">
          <h2 className="text-lg font-semibold tracking-tight">Interventions</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} intervention{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px]">
            <option value="">Tous les statuts</option>
            {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
          <Select value={smeFilter} onChange={(e) => { setSmeFilter(e.target.value); resetPage(); }} className="min-w-[180px]">
            <option value="">Toutes les PME</option>
            {smes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          </div>
        ) : isError ? (
          <p className="py-8 text-sm font-mono text-muted-foreground">Impossible de charger les interventions.</p>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-background">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signalement</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PME</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignée le</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Résolue le</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Aucun résultat</TableCell>
                    </TableRow>
                  ) : interventions.map((iv) => {
                    const sMeta = INTERVENTION_STATUS_META[iv.status];
                    return (
                      <TableRow key={iv.id}>
                        <TableCell>
                          <Link href={`/admin/hotspots/${iv.reportId}`} className="font-mono text-xs text-primary hover:underline">
                            {iv.report?.address ?? iv.reportId.slice(0, 8) + '…'}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${sMeta.bg} ${sMeta.color} border-0`}>{sMeta.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{iv.sme?.name ?? iv.smeId.slice(0, 8)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono">{iv.agent?.name ?? iv.agentId.slice(0, 8)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">{iv.assignedDate ? formatDate(iv.assignedDate) : '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">{iv.resolutionDate ? formatDate(iv.resolutionDate) : '—'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => setEditIntervention(iv)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <InterventionStatusModal
        intervention={editIntervention}
        onClose={() => setEditIntervention(null)}
        onSave={handleStatusChange}
        isSubmitting={updateIntervention.isPending}
      />
    </div>
  );
}
