'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AdminCampaignDetail } from '@/components/admin/admin-campaign-detail';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SuperviseurCampagneDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const organizationId = overview?.pme.id;

  if (overviewLoading || !organizationId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-muted-foreground">Chargement du périmètre…</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-4">
        <Link
          href="/superviseur/campagnes"
          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Campagnes
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Périmètre de l'organisation indisponible.</p>
      </div>
    );
  }

  return (
    <AdminCampaignDetail
      id={id}
      listPath="/superviseur/campagnes"
      enforceOrganizationId={organizationId}
      enforceOrganizationName={overview.pme.name}
    />
  );
}
