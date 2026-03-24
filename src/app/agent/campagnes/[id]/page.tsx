'use client';

import { use } from 'react';
import { CampagneDetail } from '@/components/agent/campagne-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AgentCampagneDetailPage({ params }: Props) {
  const { id } = use(params);
  return <CampagneDetail id={id} />;
}
