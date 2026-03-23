'use client';

import { PageHeader } from '@/components/shared/page-header';
import { SignalementsList } from '@/components/agent/signalements-list';

export default function AgentSignalementsPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Mes Signalements"
        description="Tous les signalements de votre secteur"
      />
      <SignalementsList />
    </div>
  );
}
