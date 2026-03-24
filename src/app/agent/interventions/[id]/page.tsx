'use client';

import { use } from 'react';
import { InterventionDetail } from '@/components/agent/intervention-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AgentInterventionDetailPage({ params }: Props) {
  const { id } = use(params);
  return <InterventionDetail id={id} />;
}
