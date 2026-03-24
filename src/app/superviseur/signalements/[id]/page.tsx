'use client';

import { use } from 'react';
import { SuperviseurReportDetail } from '@/components/superviseur/superviseur-report-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function SuperviseurSignalementDetailPage({ params }: Props) {
  const { id } = use(params);
  return <SuperviseurReportDetail id={id} />;
}
