'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META, SEVERITY_META_API } from '@/types/api';

const PAGE_SIZE = 15;

const NEXT_STATUS: Record<string, { status: ApiInterventionStatus; label: string }[]> = {
  ASSIGNED:    [{ status: 'IN_PROGRESS', label: 'Démarrer' }],
  IN_PROGRESS: [{ status: 'RESOLVED', label: 'Résoudre' }, { status: 'FAILED', label: 'Échouer' }],
  RESOLVED:    [],
  FAILED:      [],
};

export function InterventionsList() {
  const currentUser = useAuthStore((s) => s.user);
  const agentId = currentUser?.id;

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    agentId: agentId || undefined,
    status: statusFilter || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useInterventions(agentId ? filters : undefined);
  const interventions = data?.data ?? (Array.isArray(data) ? data : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateIntervention = useUpdateIntervention();

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } as never });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Impossible de mettre à jour');
    }
  };

  if (isLoading || !agentId) {
    return <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" /></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3 mb-4">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="min-w-[160px]">
          <option value="">Tous les statuts</option>
          {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-background">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adresse</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gravité</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PME</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Aucune intervention</TableCell></TableRow>
            ) : interventions.map((iv) => {
              const sMeta = INTERVENTION_STATUS_META[iv.status];
              const sevMeta = iv.report ? SEVERITY_META_API[iv.report.severity as keyof typeof SEVERITY_META_API] : null;
              const transitions = NEXT_STATUS[iv.status] ?? [];
              return (
                <TableRow key={iv.id}>
                  <TableCell><span className="text-sm font-mono">{iv.report?.address ?? iv.reportId.slice(0, 8)}</span></TableCell>
                  <TableCell>{sevMeta && <Badge className={`${sevMeta.bg} ${sevMeta.color} border-0`}>{sevMeta.label}</Badge>}</TableCell>
                  <TableCell><span className="text-xs font-mono">{iv.sme?.name ?? '—'}</span></TableCell>
                  <TableCell><Badge className={`${sMeta.bg} ${sMeta.color} border-0`}>{sMeta.label}</Badge></TableCell>
                  <TableCell><span className="text-xs font-mono text-muted-foreground">{iv.assignedDate ? formatDate(iv.assignedDate) : formatDate(iv.createdAt)}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {transitions.map((t) => (
                        <button
                          key={t.status}
                          type="button"
                          onClick={() => handleStatusChange(iv.id, t.status)}
                          disabled={updateIntervention.isPending}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
