'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { usePagination } from '@/hooks/usePagination';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { useAuthStore } from '@/stores/auth.store';
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

  const filters = {
    agentId: agentId || undefined,
    status: statusFilter || undefined,
    page: 1,
    limit: 15,
  };

  const { data, isLoading } = useInterventions(agentId ? filters : undefined);
  const interventions = data?.data ?? (Array.isArray(data) ? data : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const pagination = usePagination(total);
  if (agentId) filters.page = pagination.page;

  const updateIntervention = useUpdateIntervention();

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } as never });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Impossible de mettre à jour');
    }
  };

  const columns: Column<ApiIntervention>[] = [
    { key: 'address', label: 'Adresse', render: (iv) => <span className="text-sm font-mono">{iv.report?.address ?? iv.reportId.slice(0, 8)}</span> },
    { key: 'severity', label: 'Gravité', render: (iv) => { const m = iv.report ? SEVERITY_META_API[iv.report.severity as keyof typeof SEVERITY_META_API] : null; return m ? <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge> : <span>—</span>; } },
    { key: 'sme', label: 'PME', render: (iv) => <span className="text-xs font-mono">{iv.sme?.name ?? '—'}</span> },
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
          </div>
        );
      },
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pagination.reset(); }} className="min-w-[160px]">
        <option value="">Tous les statuts</option>
        {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <DataTable
      data={interventions}
      columns={columns}
      total={total}
      page={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={pagination.setPage}
      canPrev={pagination.canPrev}
      canNext={pagination.canNext}
      toolbar={toolbar}
      isLoading={isLoading || !agentId}
      getRowKey={(iv) => iv.id}
    />
  );
}
