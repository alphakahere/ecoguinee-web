'use client';

import { use } from 'react';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { CampaignForm } from '@/components/agent/campaign-form';

export default function AgentModifierCampagnePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: campaign, isLoading, isError } = useCampaign(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !campaign) {
    return <p className="text-sm font-mono text-muted-foreground py-8">Campagne introuvable.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Modifier la campagne</h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">{campaign.title}</p>
      </div>
      <CampaignForm campaign={campaign} />
    </div>
  );
}
