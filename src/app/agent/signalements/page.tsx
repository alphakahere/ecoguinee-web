'use client';

import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { SignalementsList } from '@/components/agent/signalements-list';
import { useAgentOpenNewReport } from '@/contexts/agent-new-report-context';

export default function AgentSignalementsPage() {
  const { openNewReportModal } = useAgentOpenNewReport();

  return (
    <div className="w-full">
      <PageHeader
        title="Mes Signalements"
        description="Tous les signalements de votre zone"
        action={
          <Button
            type="button"
            size="sm"
            className="hidden lg:inline-flex font-mono text-xs gap-1.5"
            onClick={openNewReportModal}
          >
            <Plus className="w-4 h-4" />
            Nouveau signalement
          </Button>
        }
      />
      <SignalementsList />
    </div>
  );
}
