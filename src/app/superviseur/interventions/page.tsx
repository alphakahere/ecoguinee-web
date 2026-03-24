'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InterventionsBoard } from '@/components/superviseur/interventions-board';
import {
  InterventionViewTabs,
  type InterventionViewMode,
} from '@/components/superviseur/intervention-view-tabs';
import { SuperviseurInterventionsTable } from '@/components/superviseur/superviseur-interventions-table';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

export default function SuperviseurInterventionsPage() {
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const smeId = overview?.pme.id;
  const [view, setView] = useState<InterventionViewMode>('kanban');

  const count = overview?.counts.interventions ?? 0;

  return (
    <div>
      <PageHeader
        title="Interventions"
        description={`${count} intervention${count !== 1 ? 's' : ''} dans votre périmètre`}
        action={<InterventionViewTabs value={view} onChange={setView} />}
      />

      {overviewLoading || !smeId ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        </div>
      ) : view === 'kanban' ? (
        <InterventionsBoard smeId={smeId} />
      ) : (
        <SuperviseurInterventionsTable smeId={smeId} />
      )}
    </div>
  );
}
