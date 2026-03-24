'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CampagnesList } from '@/components/agent/campagnes-list';

export default function AgentCampagnesPage() {
  return (
    <div>
      <PageHeader
        title="Mes Campagnes"
        description="Campagnes de sensibilisation assignées ou créées par vous"
      />
      <CampagnesList />
    </div>
  );
}
