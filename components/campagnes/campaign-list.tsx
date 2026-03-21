'use client';

import { useState } from 'react';
import { RotateCcw, Megaphone, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignCard } from '@/components/shared/campaign-card';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { API_CAMPAIGN_STATUS_META } from '@/types/api';
import type { ApiCampaignType, ApiCampaignStatus } from '@/types/api';

const TYPE_CHIPS: { id: '' | ApiCampaignType; label: string }[] = [
  { id: '', label: 'Toutes' },
  { id: 'AWARENESS', label: 'Sensibilisation' },
  { id: 'PROMOTION', label: 'Promotion' },
  { id: 'TRAINING', label: 'Formation' },
];

const STATUT_OPTS: { id: '' | ApiCampaignStatus; label: string }[] = [
  { id: '', label: 'Tous les statuts' },
  ...Object.entries(API_CAMPAIGN_STATUS_META).map(([k, v]) => ({ id: k as ApiCampaignStatus, label: v.label })),
];

const PAGE_SIZE = 9;

export function CampaignList() {
  const [typeFilter, setTypeFilter] = useState<'' | ApiCampaignType>('');
  const [statusFilter, setStatusFilter] = useState<'' | ApiCampaignStatus>('');
  const [page, setPage] = useState(1);

  const filters = {
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useCampaigns(filters);
  const campaigns = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasFilters = !!(typeFilter || statusFilter);

  const reset = () => { setTypeFilter(''); setStatusFilter(''); setPage(1); };

  return (
    <>
      {/* Filter bar */}
      <div className="sticky z-40 border-b border-border bg-background/95 backdrop-blur-md" style={{ top: 61 }}>
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TYPE_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => { setTypeFilter(chip.id); setPage(1); }}
                className="shrink-0 px-4 py-2 rounded-full font-mono text-sm transition-all"
                style={{
                  background: typeFilter === chip.id ? '#2D7D46' : 'var(--muted)',
                  color: typeFilter === chip.id ? '#fff' : 'var(--muted-foreground)',
                  border: typeFilter === chip.id ? '1px solid #2D7D46' : '1px solid var(--border)',
                }}
              >
                {chip.label}
              </button>
            ))}

            <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as '' | ApiCampaignStatus); setPage(1); }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl font-mono text-sm border border-border bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  {STATUT_OPTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {hasFilters && (
                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs text-muted-foreground border border-border hover:bg-muted/50 transition-colors">
                  <RotateCcw className="w-3 h-3" />Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Megaphone className="w-12 h-12" style={{ color: 'rgba(45,125,70,0.25)' }} />
            <p className="font-mono text-muted-foreground">Aucune campagne pour ces critères.</p>
            {hasFilters && (
              <button onClick={reset} className="flex items-center gap-2 text-sm font-mono" style={{ color: '#2D7D46' }}>
                <RotateCcw className="w-3.5 h-3.5" />Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-mono text-muted-foreground mb-6">
              {total} campagne{total > 1 ? 's' : ''}{hasFilters && ' pour ces critères'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {campaigns.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
