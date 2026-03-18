'use client';

import { PageHeader } from '@/components/shared/page-header';
import { BarChart } from '@/components/charts/bar-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { MONTHLY_CHART, EVOLUTION_CHART, SECTOR_CHART } from '@/lib/data/superviseur-data';

export default function SuperviseurRapportsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Rapports & Statistiques" description="Analyse détaillée de votre périmètre" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold mb-1">Évolution mensuelle</h3>
          <p className="text-xs font-mono text-muted-foreground mb-4">Signalements reçus vs résolus</p>
          <BarChart
            data={MONTHLY_CHART}
            xKey="mois"
            bars={[
              { dataKey: 'recus', color: '#E8A020', name: 'Reçus' },
              { dataKey: 'resolus', color: '#6FCF4A', name: 'Résolus' },
            ]}
            height={250}
          />
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold mb-1">Évolution quotidienne</h3>
          <p className="text-xs font-mono text-muted-foreground mb-4">Tendance sur les 2 dernières semaines</p>
          <AreaChart
            data={EVOLUTION_CHART}
            xKey="jour"
            areas={[
              { dataKey: 'signalements', color: '#E8A020', name: 'Signalements' },
              { dataKey: 'resolus', color: '#6FCF4A', name: 'Résolus' },
            ]}
            height={250}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold mb-1">Répartition par secteur</h3>
        <p className="text-xs font-mono text-muted-foreground mb-4">Signalements et résolutions par zone</p>
        <BarChart
          data={SECTOR_CHART}
          xKey="secteur"
          bars={[
            { dataKey: 'signalements', color: '#E8A020', name: 'Signalements' },
            { dataKey: 'resolus', color: '#6FCF4A', name: 'Résolus' },
          ]}
          height={300}
        />
      </div>
    </div>
  );
}
