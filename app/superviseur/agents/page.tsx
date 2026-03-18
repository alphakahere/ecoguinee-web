'use client';

import { PageHeader } from '@/components/shared/page-header';
import { AgentsGrid } from '@/components/superviseur/agents-grid';

export default function SuperviseurAgentsPage() {
  return (
    <div className="max-w-6xl">
      <PageHeader title="Agents" description="Équipe terrain de votre périmètre" />
      <AgentsGrid />
    </div>
  );
}
