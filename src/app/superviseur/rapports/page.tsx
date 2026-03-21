'use client';

import { PageHeader } from '@/components/shared/page-header';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

export default function SuperviseurRapportsPage() {
  const { data, isLoading } = useSupervisorOverview();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Rapports & Statistiques" description="Analyse de votre périmètre" />
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Rapports & Statistiques" description="Analyse de votre périmètre" />
        <p className="text-sm font-mono text-muted-foreground py-8">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const { counts, interventionsByStatus, agents } = data;

  const interventionChartData = [
    { name: 'Assignées',  value: interventionsByStatus.ASSIGNED },
    { name: 'En cours',   value: interventionsByStatus.IN_PROGRESS },
    { name: 'Résolues',   value: interventionsByStatus.RESOLVED },
    { name: 'Échouées',   value: interventionsByStatus.FAILED },
  ];

  const overviewData = [
    { name: 'Signalements',  value: counts.reports,   color: '#D94035' },
    { name: 'Résolus',       value: counts.resolvedReports, color: '#6FCF4A' },
    { name: 'Interventions', value: counts.interventions, color: '#E8A020' },
    { name: 'Campagnes',     value: counts.campaigns, color: '#3B82F6' },
  ];

  const agentChartData = agents.map((a) => ({
    name: a.name.split(' ')[0],
    interventions: a.interventionCount,
    resolues: a.resolvedCount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Rapports & Statistiques" description="Analyse de votre périmètre" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold mb-1">Vue d'ensemble</h3>
          <p className="text-xs font-mono text-muted-foreground mb-4">Répartition globale</p>
          <PieChart data={overviewData} height={250} />
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold mb-1">Interventions par statut</h3>
          <p className="text-xs font-mono text-muted-foreground mb-4">État actuel des interventions</p>
          <BarChart
            data={interventionChartData}
            xKey="name"
            bars={[{ dataKey: 'value', color: '#2D7D46', name: 'Interventions' }]}
            height={250}
          />
        </div>
      </div>

      {agentChartData.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold mb-1">Performance des agents</h3>
          <p className="text-xs font-mono text-muted-foreground mb-4">Interventions totales vs résolues par agent</p>
          <BarChart
            data={agentChartData}
            xKey="name"
            bars={[
              { dataKey: 'interventions', color: '#E8A020', name: 'Interventions' },
              { dataKey: 'resolues', color: '#6FCF4A', name: 'Résolues' },
            ]}
            height={300}
          />
        </div>
      )}
    </div>
  );
}
