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
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META } from '@/types/api';
import { InterventionStatusModal } from '@/components/admin/intervention-status-modal';
import { getErrorMessage } from '@/services/api';

export default function AdminInterventionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [editIntervention, setEditIntervention] = useState<ApiIntervention | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    status: statusFilter || undefined,
    organizationId: organizationFilter || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isError } = useInterventions(filters);
  const interventions = data?.data ?? (Array.isArray(data) ? data as ApiIntervention[] : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const { data: organizationsData } = useOrganizations({ page: 1, limit: 100 });
  const organizations = organizationsData?.data ?? [];
  const updateIntervention = useUpdateIntervention();

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } as never });
      toast.success('Statut mis à jour');
      setEditIntervention(null);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Impossible de mettre à jour le statut');
      toast.error(message);
    }
  };

  const columns: Column<ApiIntervention>[] = [
    { key: 'report', label: 'Signalement', render: (iv) => <Link href={`/admin/signalements/${iv.reportId}`} className="font-mono text-xs text-primary hover:underline">{iv.report?.reference ?? `#${iv.reportId.slice(0, 8)}`}</Link> },
    { key: 'status', label: 'Statut', render: (iv) => { const m = INTERVENTION_STATUS_META[iv.status]; return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>; } },
    { key: 'organization', label: 'Organisation', render: (iv) => <span className="text-sm font-mono">{iv.organization?.name ?? iv.organizationId.slice(0, 8)}</span> },
    { key: 'agent', label: 'Agent', render: (iv) => <span className="text-xs font-mono">{iv.agent?.name ?? '—'}</span> },
    { key: 'assigned', label: 'Assignée le', render: (iv) => <span className="text-xs font-mono text-muted-foreground">{iv.assignedDate ? formatDate(iv.assignedDate) : '—'}</span> },
    { key: 'resolved', label: 'Résolue le', render: (iv) => <span className="text-xs font-mono text-muted-foreground">{iv.resolutionDate ? formatDate(iv.resolutionDate) : '—'}</span> },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Interventions</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{total} intervention{total !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px] max-w-xs">
          <option value="">Tous les statuts</option>
          {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={organizationFilter} onChange={(e) => { setOrganizationFilter(e.target.value); resetPage(); }} className="min-w-[180px] max-w-xs">
          <option value="">Toutes les organisations</option>
          {organizations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <DataTable
        data={interventions as ApiIntervention[]}
        columns={columns}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canPrev={canPrev}
        canNext={canNext}
        toolbar={toolbar}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(iv) => iv.id}
      />
      <InterventionStatusModal
        intervention={editIntervention}
        onClose={() => setEditIntervention(null)}
        onSave={handleStatusChange}
        isSubmitting={updateIntervention.isPending}
      />
    </>
  );
}
