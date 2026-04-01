'use client';

import { Wrench, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

export function AgentsGrid() {
  const { data, isLoading } = useSupervisorOverview();
  const agents = data?.agents ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (agents.length === 0) {
    return <p className="text-sm font-mono text-muted-foreground text-center py-16">Aucun agent dans votre organisation.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {agents.map((agent) => {
        const total = agent.interventionCount;
        const rate = total > 0 ? Math.round((agent.resolvedCount / total) * 100) : 0;
        const initials = agent.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

        return (
          <div key={agent.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{agent.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', agent.status === 'ACTIVE' ? 'bg-[#6FCF4A]' : 'bg-muted-foreground')} />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {agent.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <Wrench className="w-3.5 h-3.5 text-[#E8A020] mx-auto mb-1" />
                <p className="text-lg font-bold">{total}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Interventions</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#6FCF4A] mx-auto mb-1" />
                <p className="text-lg font-bold">{agent.resolvedCount}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Résolues</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground">Taux de résolution</span>
                <span className="text-xs font-mono font-bold" style={{ color: rate >= 70 ? '#6FCF4A' : rate >= 50 ? '#E8A020' : '#D94035' }}>
                  {rate}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: rate >= 70 ? '#6FCF4A' : rate >= 50 ? '#E8A020' : '#D94035' }} />
              </div>
            </div>

            {agent.lastLogin && (
              <p className="text-[10px] font-mono text-muted-foreground mt-3">
                Dernière conn. {new Date(agent.lastLogin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
