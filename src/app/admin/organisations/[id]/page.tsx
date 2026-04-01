'use client';

import { use } from 'react';
import { useSME } from '@/hooks/queries/useSMEs';
import { OrganisationDetail } from '@/components/admin/organisation-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrganisationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: organisation, isLoading, isError } = useSME(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !organisation) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-mono text-muted-foreground">
          Impossible de charger l'organisation
        </p>
      </div>
    );
  }

  return <OrganisationDetail organisation={organisation} />;
}
