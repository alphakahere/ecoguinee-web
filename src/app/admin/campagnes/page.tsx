'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import type { ApiCampaign, ApiCampaignStatus, ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

export default function AdminCampagnesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: (statusFilter || undefined) as ApiCampaignStatus | undefined,
      type: (typeFilter || undefined) as ApiCampaignType | undefined,
      page,
      limit: pageSize,
    }),
    [debouncedSearch, statusFilter, typeFilter, page],
  );

  const { data, isLoading, isError } = useCampaigns(filters);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;
  const goToPage = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  const deleteCampaign = useDeleteCampaign();

  const handleDelete = async (c: ApiCampaign) => {
    if (!window.confirm(`Supprimer la campagne « ${c.title} » ?`)) return;
    try {
      await deleteCampaign.mutateAsync(c.id);
      toast.success('Campagne supprimée');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const columns: Column<ApiCampaign>[] = [
    { key: 'title', label: 'Titre', render: (c) => <Link href={`/admin/campagnes/${c.id}`} className="text-sm font-semibold hover:text-primary transition-colors">{c.title}</Link> },
    { key: 'type', label: 'Type', render: (c) => <Badge className={`${API_CAMPAIGN_TYPE_META[c.type].bg} ${API_CAMPAIGN_TYPE_META[c.type].color} border-0`}>{API_CAMPAIGN_TYPE_META[c.type].label}</Badge> },
    { key: 'zone', label: 'Zone', render: (c) => <span className="text-sm font-mono">{c.zone?.name ?? '—'}</span> },
    { key: 'status', label: 'Statut', render: (c) => <Badge className={`${API_CAMPAIGN_STATUS_META[c.status].bg} ${API_CAMPAIGN_STATUS_META[c.status].color} border-0`}>{API_CAMPAIGN_STATUS_META[c.status].label}</Badge> },
    { key: 'date', label: 'Date prévue', render: (c) => <span className="text-xs font-mono text-muted-foreground">{formatDate(c.scheduledDate)}</span> },
    { key: 'agent', label: 'Agent', render: (c) => <span className="text-xs font-mono">{c.agent?.name ?? '—'}</span> },
    {
      key: 'actions', label: '', headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground', className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/campagnes/${c.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></Link>
          <button type="button" onClick={() => handleDelete(c)} disabled={deleteCampaign.isPending} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Campagnes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} campagne{total !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/campagnes/nouvelle"><Button className="font-mono text-xs"><Plus className="w-4 h-4 mr-2" /> Nouvelle campagne</Button></Link>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Titre, zone, agent…" className="w-full max-w-md" />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="min-w-[160px] max-w-[160px]">
          <option value="">Tous les statuts</option>
          {Object.entries(API_CAMPAIGN_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="min-w-[160px] max-w-[160px]">
          <option value="">Tous les types</option>
          {Object.entries(API_CAMPAIGN_TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
      </div>
    </div>
  );

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={goToPage}
      canPrev={canPrev}
      canNext={canNext}
      toolbar={toolbar}
      isLoading={isLoading}
      isError={isError}
      getRowKey={(c) => c.id}
    />
  );
}
