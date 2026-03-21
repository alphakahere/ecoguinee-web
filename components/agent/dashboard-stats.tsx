'use client';

import { Flag, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { useAgentOverview } from '@/hooks/queries/useAgentDashboard';

export function DashboardStats() {
  const { data } = useAgentOverview();
  const counts = data?.counts;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard icon={Flag}        title="Signalements"         value={counts?.reports ?? 0}          delay={0} />
      <KPICard icon={Wrench}      title="Mes interventions"    value={counts?.myInterventions ?? 0}  delay={0.06} />
      <KPICard icon={CheckCircle} title="Résolues"             value={counts?.myResolved ?? 0}       delay={0.12} />
      <KPICard icon={TrendingUp}  title="Taux de résolution"   value={data?.resolutionRate ?? 0}     delay={0.18} />
    </div>
  );
}
