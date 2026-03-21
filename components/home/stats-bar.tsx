'use client';

import { usePublicStats } from '@/hooks/queries/usePublicStats';

export function StatsBar() {
  const { data } = usePublicStats();

  const stats = [
    { value: data?.totalReports ?? 0, label: 'Signalements', suffix: '' },
    { value: data?.resolvedReports ?? 0, label: 'Résolus', suffix: '' },
    { value: data?.activeSmes ?? 0, label: 'PMEs actives', suffix: '' },
    { value: data?.totalCampaigns ?? 0, label: 'Campagnes', suffix: '' },
  ];

  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary font-mono">
                {s.value}{s.suffix}
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
