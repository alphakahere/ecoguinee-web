'use client';

import { Flag, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { hotspots } from '@/lib/data/mock-data';

const MY_REPORTS = hotspots.filter((h) => h.location.territoire === 'Dixinn');
const ACTIVE = MY_REPORTS.filter((h) => h.status !== 'resolved').length;
const IN_PROG = MY_REPORTS.filter((h) => h.status === 'in-progress').length;
const RESOLVED = MY_REPORTS.filter((h) => h.status === 'resolved').length;
const RATE_PCT = Math.round((RESOLVED / Math.max(MY_REPORTS.length, 1)) * 100);

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard icon={Flag}        title="Signalements actifs"    value={ACTIVE}   color="warning" delay={0} />
      <KPICard icon={Wrench}      title="Interventions en cours" value={IN_PROG}  color="primary" delay={0.06} />
      <KPICard icon={CheckCircle} title="Résolus ce mois"        value={RESOLVED} color="success" delay={0.12} trend={RATE_PCT} />
      <KPICard icon={TrendingUp}  title="Taux de résolution"     value={RATE_PCT} color="neutral" delay={0.18} />
    </div>
  );
}
