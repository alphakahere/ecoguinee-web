'use client';

import { CampaignForm } from '@/components/agent/campaign-form';

export default function AgentNouvelCampagnePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Nouvelle campagne</h1>
        <p className="text-sm font-mono text-muted-foreground mt-1">Planifier ou enregistrer une campagne de sensibilisation</p>
      </div>
      <CampaignForm />
    </div>
  );
}
