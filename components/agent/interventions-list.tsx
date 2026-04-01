'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { useAuthStore } from '@/stores/auth.store';
import { ResolveInterventionDialog } from '@/components/agent/resolve-intervention-dialog';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META, SEVERITY_META_API } from '@/types/api';

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
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    agentId: agentId || undefined,
    status: statusFilter || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading } = useInterventions(agentId ? filters : undefined);
  const interventions = data?.data ?? [];
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const updateIntervention = useUpdateIntervention();
  const [resolveTargetId, setResolveTargetId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    if (status === 'RESOLVED') {
      setResolveTargetId(id);
      return;
    }
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Impossible de mettre à jour');
    }
  };

  const columns: Column<ApiIntervention>[] = [
    { key: 'address', label: 'Adresse', render: (iv) => <span className="text-sm font-mono">{iv.report?.address ?? iv.reportId.slice(0, 8)}</span> },
    { key: 'severity', label: 'Gravité', render: (iv) => {
      const sev = iv.report?.severity;
      const m = sev ? SEVERITY_META_API[sev] : null;
      return m ? <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge> : <span>—</span>;
    } },
    { key: 'sme', label: 'Organisation', render: (iv) => <span className="text-xs font-mono">{iv.sme?.name ?? '—'}</span> },
    { key: 'status', label: 'Statut', render: (iv) => { const m = INTERVENTION_STATUS_META[iv.status]; return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>; } },
    { key: 'date', label: 'Date', render: (iv) => <span className="text-xs font-mono text-muted-foreground">{iv.assignedDate ? formatDate(iv.assignedDate) : formatDate(iv.createdAt)}</span> },
    {
      key: 'actions', label: '', headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground', className: 'text-right',
      render: (iv) => {
        const transitions = NEXT_STATUS[iv.status] ?? [];
        return (
          <div className="flex items-center justify-end gap-1">
            {transitions.map((t) => (
              <button key={t.status} type="button" onClick={() => handleStatusChange(iv.id, t.status)} disabled={updateIntervention.isPending} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50">{t.label}</button>
            ))}
            <Link href={`/agent/interventions/${iv.id}`} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors">
              Voir
            </Link>
          </div>
        );
      },
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px] max-w-xs">
        <option value="">Tous les statuts</option>
        {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <>
      <ResolveInterventionDialog
        open={resolveTargetId !== null}
        interventionId={resolveTargetId ?? ''}
        onClose={() => setResolveTargetId(null)}
      />

      {/* Mobile cards */}
      <div className="lg:hidden">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="mb-5">{toolbar}</div>
          {(isLoading || !agentId) ? (
            <div className="flex justify-center py-10">
              <span className="h-7 w-7 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
            </div>
          ) : interventions.length === 0 ? (
            <p className="py-8 text-sm font-mono text-muted-foreground text-center">Aucun résultat</p>
          ) : (
            <>
              <div className="space-y-2">
                {interventions.map((iv) => {
                  const sMeta = INTERVENTION_STATUS_META[iv.status];
                  const sev = iv.report?.severity;
                  const sevMeta = sev ? SEVERITY_META_API[sev] : null;
                  const transitions = NEXT_STATUS[iv.status] ?? [];
                  return (
                    <div key={iv.id} className="rounded-xl border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className={`${sMeta.bg} ${sMeta.color} border-0 text-[10px]`}>{sMeta.label}</Badge>
                          {sevMeta && <Badge className={`${sevMeta.bg} ${sevMeta.color} border-0 text-[10px]`}>{sevMeta.label}</Badge>}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {iv.assignedDate ? formatDate(iv.assignedDate) : formatDate(iv.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-mono truncate">{iv.report?.address ?? `#${iv.reportId.slice(0, 8)}`}</span>
                        {iv.sme && <span className="text-[10px] font-mono text-muted-foreground">{iv.sme.name}</span>}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        {transitions.map((t) => (
                          <button key={t.status} type="button" onClick={() => handleStatusChange(iv.id, t.status)} disabled={updateIntervention.isPending} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50">{t.label}</button>
                        ))}
                        <Link href={`/agent/interventions/${iv.id}`} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors">
                          Voir
                        </Link>
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
          data={interventions}
          columns={columns}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          canPrev={canPrev}
          canNext={canNext}
          toolbar={toolbar}
          isLoading={isLoading || !agentId}
          getRowKey={(iv) => iv.id}
        />
      </div>
    </>
  );
}
