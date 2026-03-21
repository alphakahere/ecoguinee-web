'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useAuthStore } from '@/stores/auth.store';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

export default function AgentCampagnesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const agentId = currentUser?.id;

  const { data, isLoading } = useCampaigns(agentId ? { agentId, limit: 50 } : undefined);
  const campaigns = data?.data ?? [];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Mes Campagnes"
        description="Campagnes de sensibilisation qui vous sont assignées"
      />

      {isLoading || !agentId ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">
          Aucune campagne assignée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const statusMeta = API_CAMPAIGN_STATUS_META[c.status];
            const typeMeta = API_CAMPAIGN_TYPE_META[c.type];
            return (
              <div key={c.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>{typeMeta.label}</Badge>
                  <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>{statusMeta.label}</Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{c.zone?.name ?? '—'}</span>
                  <span>{formatDate(c.scheduledDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
