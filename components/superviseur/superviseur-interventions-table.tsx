'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useInterventions } from '@/hooks/queries/useInterventions';
import type { ApiIntervention } from '@/types/api';
import { INTERVENTION_STATUS_META } from '@/types/api';

interface Props {
  organizationId: string;
}

export function SuperviseurInterventionsTable({ organizationId }: Props) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    organizationId,
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError } = useInterventions(filters);

  const interventions = data?.data ?? (Array.isArray(data) ? (data as ApiIntervention[]) : []);
  const total = data && 'total' in data ? data.total : interventions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const columns: Column<ApiIntervention>[] = [
    {
      key: 'id',
      label: 'Réf.',
      render: (iv) => (
        <span className="font-mono text-xs text-muted-foreground">{iv.reference ?? `#${iv.id.slice(0, 8)}`}</span>
      ),
    },
    {
      key: 'report',
      label: 'Signalement',
      render: (iv) => (
        <Link
          href={`/superviseur/signalements/${iv.reportId}`}
          className="font-mono text-xs text-primary hover:underline line-clamp-2 max-w-[220px] inline-block align-top"
        >
          {iv.report?.reference ?? iv.report?.address?.trim() ?? `#${iv.reportId.slice(0, 8)}`}
        </Link>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (iv) => {
        const m = INTERVENTION_STATUS_META[iv.status];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (iv) => (
        <span className="text-xs font-mono">{iv.agent?.name ?? '—'}</span>
      ),
    },
    {
      key: 'assigned',
      label: 'Assignée le',
      render: (iv) => (
        <span className="text-xs font-mono text-muted-foreground">
          {iv.assignedDate ? formatDate(iv.assignedDate) : formatDate(iv.createdAt)}
        </span>
      ),
    },
    {
      key: 'resolved',
      label: 'Résolue le',
      render: (iv) => (
        <span className="text-xs font-mono text-muted-foreground">
          {iv.resolutionDate ? formatDate(iv.resolutionDate) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      headerClassName:
        'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right w-[52px]',
      render: (iv) => (
        <Link
          href={`/superviseur/signalements/${iv.reportId}`}
          className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Voir le signalement"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          resetPage();
        }}
        placeholder="Rechercher (notes, adresse…)…"
        className="w-full max-w-md"
      />
      <Select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          resetPage();
        }}
        className="min-w-[160px] max-w-xs"
      >
        <option value="">Tous les statuts</option>
        {Object.entries(INTERVENTION_STATUS_META).map(([v, m]) => (
          <option key={v} value={v}>
            {m.label}
          </option>
        ))}
      </Select>
    </div>
  );

  return (
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
      isLoading={isLoading}
      isError={isError}
      getRowKey={(iv) => iv.id}
    />
  );
}
