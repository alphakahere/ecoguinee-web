'use client';

import { use } from 'react';
import { CampagneDetail } from '@/components/agent/campagne-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SuperviseurCampagneDetailPage({ params }: Props) {
  const { id } = use(params);
  return <CampagneDetail id={id} basePath="/superviseur/campagnes" />;
}
