'use client';

import { use } from 'react';
import { AdminInterventionDetail } from '@/components/admin/intervention-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminInterventionDetailPage({ params }: Props) {
  const { id } = use(params);
  return <AdminInterventionDetail id={id} />;
}
