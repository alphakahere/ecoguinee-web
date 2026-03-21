'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flag, Wrench, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import { useAuthStore } from '@/stores/auth.store';
import { REPORT_STATUS_META } from '@/types/api';
import { BarChart } from '@/components/charts/bar-chart';

const SEV_COLOR: Record<string, string> = { LOW: '#6B7280', MODERATE: '#E8A020', CRITICAL: '#D94035' };

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

export function DashboardOverview() {
  const { data, isLoading } = useSupervisorOverview();
  const currentUser = useAuthStore((s) => s.user);
  const firstName = currentUser?.name?.split(' ')[0] ?? 'Superviseur';

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-sm font-mono text-muted-foreground py-8">Impossible de charger le tableau de bord.</p>;

  const { counts, resolutionRate, interventionsByStatus, recentReports, agents, pme } = data;
  const activeAgents = agents.filter((a) => a.status === 'ACTIVE').length;

  const chartData = [
    { name: 'Assignées', value: interventionsByStatus.ASSIGNED },
    { name: 'En cours', value: interventionsByStatus.IN_PROGRESS },
    { name: 'Résolues', value: interventionsByStatus.RESOLVED },
    { name: 'Échouées', value: interventionsByStatus.FAILED },
  ];

  return (
    <>
      {/* Greeting + zones */}
      <motion.div {...anim(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Bonjour, {firstName}</h3>
          <p className="text-xs font-mono text-muted-foreground">{pme.name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pme.zones.slice(0, 5).map((z) => (
            <span key={z.id} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
              {z.name}
            </span>
          ))}
          {pme.zones.length > 5 && <span className="text-[10px] font-mono text-muted-foreground">+{pme.zones.length - 5}</span>}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flag, label: 'Signalements', value: counts.reports, color: '#D94035', bg: 'bg-[#D94035]/10' },
          { icon: Wrench, label: 'Interventions', value: counts.interventions, color: '#E8A020', bg: 'bg-[#E8A020]/10' },
          { icon: TrendingUp, label: 'Résolution', value: `${resolutionRate}%`, color: '#6FCF4A', bg: 'bg-[#6FCF4A]/10' },
          { icon: Users, label: 'Agents actifs', value: `${activeAgents}/${counts.agents}`, color: '#2D7D46', bg: 'bg-[#2D7D46]/10' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...anim(i + 1)} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', kpi.bg)}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent reports + Agent performance */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div {...anim(5)} className="lg:col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Signalements récents</h3>
            <Link href="/superviseur/signalements" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
              Tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentReports.length === 0 ? (
              <p className="text-sm font-mono text-muted-foreground text-center py-8">Aucun signalement</p>
            ) : recentReports.map((r) => {
              const sMeta = REPORT_STATUS_META[r.status as keyof typeof REPORT_STATUS_META];
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: SEV_COLOR[r.severity] ?? '#6B7280' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{r.address ?? r.zone?.name ?? r.id.slice(0, 8)}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{r.zone?.name ?? '—'} · {formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-mono shrink-0 ml-2', sMeta?.color)}>{sMeta?.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...anim(6)} className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Agents</h3>
            <Link href="/superviseur/agents" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
              Tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {agents.length === 0 ? (
              <p className="text-sm font-mono text-muted-foreground text-center py-8">Aucun agent</p>
            ) : agents.map((a) => {
              const total = a.interventionCount;
              const rate = total > 0 ? Math.round((a.resolvedCount / total) * 100) : 0;
              return (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full', a.status === 'ACTIVE' ? 'bg-[#6FCF4A]' : 'bg-muted-foreground')} />
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: rate >= 70 ? '#6FCF4A' : rate >= 40 ? '#E8A020' : '#D94035' }}>
                      {a.resolvedCount}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: rate >= 70 ? '#6FCF4A' : rate >= 40 ? '#E8A020' : '#D94035' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Interventions by status chart */}
      <motion.div {...anim(7)} className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-1">Interventions par statut</h3>
        <p className="text-xs font-mono text-muted-foreground mb-4">Répartition actuelle</p>
        <BarChart
          data={chartData}
          xKey="name"
          bars={[{ dataKey: 'value', color: '#2D7D46', name: 'Interventions' }]}
          height={200}
        />
      </motion.div>
    </>
  );
}
