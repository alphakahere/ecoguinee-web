'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/shared/data-table';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { useAuthStore } from '@/stores/auth.store';
import { CompleteCampaignDialog } from './complete-campaign-dialog';
import type { ApiCampaign, ApiCampaignStatus } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';
import { getErrorMessage } from '@/services/api';

const STATUS_FILTER_OPTIONS = Object.entries(API_CAMPAIGN_STATUS_META) as [ApiCampaignStatus, { label: string }][];

const NEXT_STATUS: Record<string, { status: ApiCampaignStatus; label: string }[]> = {
  PLANNED:     [{ status: 'IN_PROGRESS', label: 'Démarrer' }],
  IN_PROGRESS: [{ status: 'COMPLETED',   label: 'Terminer' }],
  COMPLETED:   [],
  CANCELLED:   [],
};

export function CampagnesList() {
  const currentUser = useAuthStore((s) => s.user);
  const agentId = currentUser?.id ?? '';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [completeTarget, setCompleteTarget] = useState<{ id: string; photos: string[] } | null>(null);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  const filters = {
    agentId: agentId || undefined,
    status: (statusFilter || undefined) as ApiCampaignStatus | undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading } = useCampaigns(agentId ? filters : undefined);
  const campaigns = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  async function handleStatusChange(c: ApiCampaign, status: ApiCampaignStatus) {
    if (status === 'COMPLETED') {
      setCompleteTarget({ id: c.id, photos: c.photos ?? [] });
      return;
    }
    try {
      await updateCampaign.mutateAsync({ id: c.id, payload: { status } });
      toast.success('Statut mis à jour');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Impossible de mettre à jour le statut');
      toast.error(message);
    }
  }

  async function handleDelete(c: ApiCampaign) {
    if (!confirm(`Supprimer la campagne "${c.title}" ?`)) return;
    try {
      await deleteCampaign.mutateAsync(c.id);
      toast.success('Campagne supprimée');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Impossible de supprimer la campagne');
      toast.error(message);
    }
  }

  const toolbar = (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
        className="min-w-[160px] px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="">Tous les statuts</option>
        {STATUS_FILTER_OPTIONS.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </select>
      <Link
        href="/agent/campagnes/nouvelle"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" /> Nouvelle campagne
      </Link>
    </div>
  );

  const columns: Column<ApiCampaign>[] = [
    { key: 'title', label: 'Titre', render: (c) => <span className="text-sm font-mono font-medium">{c.title}</span> },
    { key: 'type', label: 'Type', render: (c) => { const m = API_CAMPAIGN_TYPE_META[c.type]; return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>; } },
    { key: 'status', label: 'Statut', render: (c) => { const m = API_CAMPAIGN_STATUS_META[c.status]; return <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>; } },
    { key: 'zone', label: 'Zone', render: (c) => <span className="text-xs font-mono text-muted-foreground">{c.zone?.name ?? '—'}</span> },
    { key: 'date', label: 'Date prévue', render: (c) => <span className="text-xs font-mono text-muted-foreground">{formatDate(c.scheduledDate)}</span> },
    {
      key: 'actions', label: '',
      headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right',
      render: (c) => {
        const transitions = NEXT_STATUS[c.status] ?? [];
        return (
          <div className="flex items-center justify-end gap-1">
            {transitions.map((t) => (
              <button key={t.status} type="button" onClick={() => handleStatusChange(c, t.status)} disabled={updateCampaign.isPending} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50">{t.label}</button>
            ))}
            <Link href={`/agent/campagnes/${c.id}`} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors">Voir</Link>
            <Link href={`/agent/campagnes/${c.id}/modifier`} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Pencil className="w-3 h-3" />
            </Link>
            <button type="button" onClick={() => handleDelete(c)} disabled={deleteCampaign.isPending} className="p-1.5 rounded-lg border border-destructive/40 hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Mobile cards */}
      <div className="lg:hidden">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="mb-5">{toolbar}</div>
          {(isLoading || !agentId) ? (
            <div className="flex justify-center py-10">
              <span className="h-7 w-7 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="py-8 text-sm font-mono text-muted-foreground text-center">Aucune campagne</p>
          ) : (
            <>
              <div className="space-y-2">
                {campaigns.map((c) => {
                  const typeMeta = API_CAMPAIGN_TYPE_META[c.type];
                  const statusMeta = API_CAMPAIGN_STATUS_META[c.status];
                  return (
                    <div key={c.id} className="rounded-xl border border-border bg-background p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-mono font-medium truncate">{c.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0 text-[10px]`}>{typeMeta.label}</Badge>
                            <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0 text-[10px]`}>{statusMeta.label}</Badge>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{formatDate(c.scheduledDate)}</span>
                      </div>
                      {c.zone && <p className="text-[10px] font-mono text-muted-foreground">{c.zone.name}</p>}
                      <div className="flex items-center justify-end gap-1 pt-1 flex-wrap">
                        {(NEXT_STATUS[c.status] ?? []).map((t) => (
                          <button key={t.status} type="button" onClick={() => handleStatusChange(c, t.status)} disabled={updateCampaign.isPending} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50">{t.label}</button>
                        ))}
                        <Link href={`/agent/campagnes/${c.id}`} className="px-2 py-1 rounded-lg text-[10px] font-mono border border-border hover:bg-muted transition-colors">Voir</Link>
                        <Link href={`/agent/campagnes/${c.id}/modifier`} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3 h-3" />
                        </Link>
                        <button type="button" onClick={() => handleDelete(c)} disabled={deleteCampaign.isPending} className="p-1.5 rounded-lg border border-destructive/40 hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50">
                          <Trash2 className="w-3 h-3" />
                        </button>
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
          data={campaigns}
          columns={columns}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          canPrev={canPrev}
          canNext={canNext}
          toolbar={toolbar}
          isLoading={isLoading || !agentId}
          getRowKey={(c) => c.id}
        />
      </div>

      <CompleteCampaignDialog
        open={completeTarget !== null}
        campaignId={completeTarget?.id ?? ''}
        existingPhotos={completeTarget?.photos ?? []}
        onClose={() => setCompleteTarget(null)}
      />
    </>
  );
}
