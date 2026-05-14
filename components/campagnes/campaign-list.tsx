'use client';

import { useState } from 'react';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignCard } from '@/components/shared/campaign-card';
import { useCampaigns } from '@/hooks/queries/useCampaigns';

const PAGE_SIZE = 9;

export function CampaignList() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCampaigns({ page, limit: PAGE_SIZE });
  const campaigns = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Megaphone className="w-12 h-12" style={{ color: 'rgba(45,125,70,0.25)' }} />
          <p className="font-mono text-muted-foreground">Aucune campagne pour le moment.</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-mono text-muted-foreground mb-6">
            {total} campagne{total > 1 ? 's' : ''}
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
  );
}
