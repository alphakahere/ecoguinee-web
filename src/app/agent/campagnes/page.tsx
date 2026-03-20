import { PageHeader } from '@/components/shared/page-header';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CampaignCard } from '@/components/shared/campaign-card';

const agentCampaigns = CAMPAIGNS.filter((c) => c.agentNom === 'Fatoumata Camara');

export default function AgentCampagnesPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Mes Campagnes"
        description="Campagnes de sensibilisation qui vous sont assignées"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agentCampaigns.map((c, i) => (
          <CampaignCard key={c.id} campaign={c} index={i} />
        ))}
      </div>
      {agentCampaigns.length === 0 && (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">
          Aucune campagne assignée pour le moment.
        </p>
      )}
    </div>
  );
}
