'use client';

import { PageHeader } from '@/components/shared/page-header';
import { InterventionsBoard } from '@/components/superviseur/interventions-board';

export default function SuperviseurInterventionsPage() {
  return (
    <div>
      <PageHeader title="Interventions" description="Suivi kanban des interventions" />
      <InterventionsBoard />
    </div>
  );
}
