'use client';

import Link from 'next/link';
import { Flag, Wrench, CheckCircle, Users, ArrowRight } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { BarChart } from '@/components/charts/bar-chart';
import { PME_REPORTS, AGENTS, ACTIVITY_FEED, MONTHLY_CHART } from '@/lib/data/superviseur-data';
import { StatusBadge } from '@/components/shared/status-badge';
import { SeverityBadge } from '@/components/shared/severity-badge';

const inProgress = PME_REPORTS.filter((r) => r.status === 'in-progress').length;
const resolved = PME_REPORTS.filter((r) => r.status === 'resolved').length;
const activeAgents = AGENTS.filter((a) => a.active).length;
const resolvePct = Math.round((resolved / Math.max(PME_REPORTS.length, 1)) * 100);

export function DashboardOverview() {
  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard icon={Flag} title="Signalements" value={PME_REPORTS.length} color="warning" delay={0} />
        <KPICard icon={Wrench} title="En cours" value={inProgress} color="primary" delay={0.06} />
        <KPICard icon={CheckCircle} title="Résolus" value={resolved} color="success" delay={0.12} trend={resolvePct} />
        <KPICard icon={Users} title="Agents actifs" value={activeAgents} color="neutral" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent reports */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Derniers signalements</h3>
            <Link href="/superviseur/signalements" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
              Voir tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {PME_REPORTS.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <SeverityBadge severity={h.severity} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{h.location.sector}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{h.id} · {h.location.address}</p>
                  </div>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Activité récente</h3>
          </div>
          <div className="divide-y divide-border">
            {ACTIVITY_FEED.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate">{a.text}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
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
    </>
  );
}
