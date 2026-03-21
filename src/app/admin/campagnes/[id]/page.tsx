'use client';

import { use } from 'react';
import { AdminCampaignDetail } from '@/components/admin/admin-campaign-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminCampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  return <AdminCampaignDetail id={id} />;
}
