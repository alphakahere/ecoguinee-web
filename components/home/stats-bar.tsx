import { dashboardStats } from '@/lib/data/mock-data';
import { territoires } from '@/lib/data/mock-data';

const totalResolved = territoires.reduce((s, t) => s + t.resolvedCount, 0);

const stats = [
  { value: dashboardStats.totalHotspots, label: 'Signalements', suffix: '' },
  { value: dashboardStats.activeInterventions, label: 'Interventions actives', suffix: '' },
  { value: totalResolved, label: 'Résolus', suffix: '' },
  { value: dashboardStats.weeklyTrend, label: 'Tendance', suffix: '%' },
];

export function StatsBar() {
  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary font-mono">
                {s.label === 'Tendance' ? '+' : ''}{s.value}{s.suffix}
              </p>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
