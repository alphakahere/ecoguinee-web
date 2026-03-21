'use client';

import { use } from 'react';
import { HotspotDetail } from '@/components/admin/hotspot-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminHotspotDetailPage({ params }: Props) {
  const { id } = use(params);
  return <HotspotDetail id={id} />;
}
