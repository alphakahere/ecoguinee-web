'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

export default function SuperviseurCampagnesPage() {
  const { data: overview } = useSupervisorOverview();
  const smeId = overview?.pme.id;

  const { data, isLoading } = useCampaigns(smeId ? { smeId, limit: 50 } : undefined);
  const campaigns = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Campagnes"
        description={smeId ? `Campagnes liées à ${overview?.pme.name}` : 'Chargement…'}
      />

      {isLoading || !smeId ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">Aucune campagne dans votre périmètre.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
