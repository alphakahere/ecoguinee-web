import { PageHeader } from '@/components/shared/page-header';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CampaignCard } from '@/components/shared/campaign-card';
import { PME_PROFILE } from '@/lib/data/superviseur-data';

const pmeCampaigns = CAMPAIGNS.filter(
  (c) => c.pmeOrganisatrice === PME_PROFILE.name || PME_PROFILE.secteurs.includes(c.secteur)
);

export default function SuperviseurCampagnesPage() {
  return (
    <div>
      <PageHeader
        title="Campagnes"
        description={`Campagnes liées à ${PME_PROFILE.name}`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pmeCampaigns.map((c, i) => (
          <CampaignCard key={c.id} campaign={c} index={i} />
        ))}
      </div>
      {pmeCampaigns.length === 0 && (
        <p className="text-sm font-mono text-muted-foreground text-center py-16">
          Aucune campagne dans votre périmètre.
        </p>
      )}
    </div>
  );
}
