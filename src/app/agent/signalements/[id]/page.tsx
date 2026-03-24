'use client';

import { use } from 'react';
import { SignalementDetail } from '@/components/agent/signalement-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AgentSignalementDetailPage({ params }: Props) {
  const { id } = use(params);
  return <SignalementDetail id={id} />;
}
