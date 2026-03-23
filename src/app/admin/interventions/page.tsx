'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { useSMEs } from '@/hooks/queries/useSMEs';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META } from '@/types/api';
import { InterventionStatusModal } from '@/components/admin/intervention-status-modal';

export default function AdminInterventionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [smeFilter, setSmeFilter] = useState('');
  const [editIntervention, setEditIntervention] = useState<ApiIntervention | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    status: statusFilter || undefined,
    smeId: smeFilter || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isError } = useInterventions(filters);
  const interventions = data?.data ?? (Array.isArray(data) ? data as ApiIntervention[] : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const { data: smesData } = useSMEs({ page: 1, limit: 100 });
  const smes = smesData?.data ?? [];
  const updateIntervention = useUpdateIntervention();

  const handleStatusChange = async (id: string, status: ApiInterventionStatus) => {
    try {
      await updateIntervention.mutateAsync({ id, payload: { status } as never });
      toast.success('Statut mis à jour');
      setEditIntervention(null);
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const columns: Column<ApiIntervention>[] = [
    { key: 'report', label: 'Signalement', render: (iv) => <Link href={`/admin/hotspots/${iv.reportId}`} className="font-mono text-xs text-primary hover:underline">{iv.report?.address ?? iv.reportId.slice(0, 8) + '…'}</Link> },
    { key: 'status', label: 'Statut', render: (iv) => { const m = INTERVENTION_STATUS_META[iv.status]; return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>; } },
    { key: 'sme', label: 'PME', render: (iv) => <span className="text-sm font-mono">{iv.sme?.name ?? iv.smeId.slice(0, 8)}</span> },
    { key: 'agent', label: 'Agent', render: (iv) => <span className="text-xs font-mono">{iv.agent?.name ?? iv.agentId.slice(0, 8)}</span> },
    { key: 'assigned', label: 'Assignée le', render: (iv) => <span className="text-xs font-mono text-muted-foreground">{iv.assignedDate ? formatDate(iv.assignedDate) : '—'}</span> },
    { key: 'resolved', label: 'Résolue le', render: (iv) => <span className="text-xs font-mono text-muted-foreground">{iv.resolutionDate ? formatDate(iv.resolutionDate) : '—'}</span> },
    {
      key: 'actions', label: '', headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground', className: 'text-right',
      render: (iv) => <button type="button" onClick={() => setEditIntervention(iv)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>,
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Interventions</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{total} intervention{total !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px] max-w-[160px]">
          <option value="">Tous les statuts</option>
          {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={smeFilter} onChange={(e) => { setSmeFilter(e.target.value); resetPage(); }} className="min-w-[180px] max-w-[180px]">
          <option value="">Toutes les PME</option>
          {smes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
