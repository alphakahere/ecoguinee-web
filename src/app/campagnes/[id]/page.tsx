'use client';

import { use } from 'react';
import { CampaignDetailView } from '@/components/campagnes/campaign-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  return <CampaignDetailView id={id} />;
}
