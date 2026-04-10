'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import type { ApiCampaign, ApiCampaignStatus, ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';
import { getErrorMessage } from '@/services/api';

const pageSize = 15;

export default function SuperviseurCampagnesPage() {
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const organizationId = overview?.pme.id;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const resetPage = () => setPage(1);

  const filters = useMemo(
    () =>
      organizationId
        ? {
            organizationId,
            search: debouncedSearch || undefined,
            status: (statusFilter || undefined) as ApiCampaignStatus | undefined,
            type: (typeFilter || undefined) as ApiCampaignType | undefined,
            page,
            limit: pageSize,
          }
        : undefined,
    [organizationId, debouncedSearch, statusFilter, typeFilter, page],
  );

  const { data, isLoading, isError } = useCampaigns(filters, {
    enabled: !!organizationId,
  });

  const deleteCampaign = useDeleteCampaign();

  const handleDelete = async (c: ApiCampaign) => {
    if (!window.confirm(`Supprimer la campagne « ${c.title} » ?`)) return;
    try {
      await deleteCampaign.mutateAsync(c.id);
      toast.success('Campagne supprimée');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Suppression impossible');
      toast.error(message);
    }
  };

  const campaigns = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const columns: Column<ApiCampaign>[] = [
    {
      key: 'title',
      label: 'Titre',
      render: (c) => (
        <Link
          href={`/superviseur/campagnes/${c.id}`}
          className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2"
        >
          {c.title}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (c) => (
        <Badge className={`${API_CAMPAIGN_TYPE_META[c.type].bg} ${API_CAMPAIGN_TYPE_META[c.type].color} border-0`}>
          {API_CAMPAIGN_TYPE_META[c.type].label}
        </Badge>
      ),
    },
    {
      key: 'zone',
      label: 'Zone',
      render: (c) => <span className="text-sm font-mono">{c.zone?.name ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (c) => (
        <Badge className={`${API_CAMPAIGN_STATUS_META[c.status].bg} ${API_CAMPAIGN_STATUS_META[c.status].color} border-0`}>
          {API_CAMPAIGN_STATUS_META[c.status].label}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Date prévue',
      render: (c) => (
        <span className="text-xs font-mono text-muted-foreground">{formatDate(c.scheduledDate)}</span>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (c) => <span className="text-xs font-mono">{c.agent?.name ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      headerClassName:
        'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/superviseur/campagnes/${c.id}`}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Voir le détail"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/superviseur/campagnes/${c.id}/modifier`}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(c)}
            disabled={deleteCampaign.isPending}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
        placeholder="Titre, zone, agent…"
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
        {Object.entries(API_CAMPAIGN_STATUS_META).map(([v, m]) => (
          <option key={v} value={v}>
            {m.label}
          </option>
        ))}
      </Select>
      <Select
        value={typeFilter}
        onChange={(e) => {
          setTypeFilter(e.target.value);
          resetPage();
        }}
        className="min-w-[160px] max-w-xs"
      >
        <option value="">Tous les types</option>
        {Object.entries(API_CAMPAIGN_TYPE_META).map(([v, m]) => (
          <option key={v} value={v}>
            {m.label}
          </option>
        ))}
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Campagnes"
        description={
          overviewLoading || !overview
            ? 'Chargement…'
            : `${total} campagne${total !== 1 ? 's' : ''} — ${overview.pme.name}`
        }
        action={
          organizationId ? (
            <Link href="/superviseur/campagnes/nouvelle">
              <Button className="font-mono text-xs">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle campagne
              </Button>
            </Link>
          ) : undefined
        }
      />

      {!organizationId && !overviewLoading ? (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">
          Périmètre de l'organisation indisponible.
        </p>
      ) : (
        <DataTable
          data={campaigns}
          columns={columns}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          canPrev={canPrev}
          canNext={canNext}
          toolbar={toolbar}
          isLoading={isLoading || overviewLoading}
          isError={isError}
          emptyMessage="Aucune campagne dans votre périmètre."
          getRowKey={(c) => c.id}
        />
      )}
    </div>
  );
}
