'use client';

import { PageHeader } from '@/components/shared/page-header';
import { InterventionsList } from '@/components/agent/interventions-list';

export default function AgentInterventionsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Mes Interventions"
        description="Interventions assignées à votre équipe"
      />
      <InterventionsList />
    </div>
  );
}
