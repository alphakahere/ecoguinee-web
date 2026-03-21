'use client';

import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import type { ApiCampaign } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

export default function AdminCampagnesPage() {
  const { data, isLoading, isError } = useCampaigns();
  const campaignsList = data?.data ?? [];
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

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (c: ApiCampaign) => (
        <Link
          href={`/admin/campagnes/${c.id}`}
          className="text-sm font-semibold hover:text-primary transition-colors"
        >
          {c.title}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (c: ApiCampaign) => {
        const m = API_CAMPAIGN_TYPE_META[c.type];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'zone',
      label: 'Zone',
      render: (c: ApiCampaign) => (
        <span className="text-sm font-mono">{c.zone?.name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (c: ApiCampaign) => {
        const m = API_CAMPAIGN_STATUS_META[c.status];
        return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>;
      },
    },
    {
      key: 'scheduledDate',
      label: 'Date prévue',
      render: (c: ApiCampaign) => (
        <span className="text-xs font-mono text-muted-foreground">{formatDate(c.scheduledDate)}</span>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (c: ApiCampaign) => (
        <span className="text-xs font-mono">{c.agent?.name ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (c: ApiCampaign) => (
        <button
          type="button"
          onClick={() => handleDelete(c)}
          disabled={deleteCampaign.isPending}
          className="text-xs font-mono text-[#D94035] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Statut',
      options: Object.entries(API_CAMPAIGN_STATUS_META).map(([v, m]) => ({ value: v, label: m.label })),
    },
    {
      key: 'type',
      label: 'Type',
      options: Object.entries(API_CAMPAIGN_TYPE_META).map(([v, m]) => ({ value: v, label: m.label })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Campagnes"
        description={
          isLoading
            ? 'Chargement…'
            : isError
              ? 'Erreur de chargement'
              : `${campaignsList.length} campagnes`
        }
        action={
          <Link href="/admin/campagnes/nouvelle">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nouvelle campagne
            </Button>
          </Link>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">
          Impossible de charger les campagnes.
        </p>
      ) : (
        <DataTable
          data={campaignsList}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher une campagne..."
          getSearchValue={(c) =>
            `${c.title} ${c.zone?.name ?? ''} ${c.agent?.name ?? ''} ${c.description ?? ''}`
          }
        />
      )}
    </div>
  );
}
