'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Building2, Map, ArrowRight, ChevronDown } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { users, hotspots, territoires, pmeList, dashboardStats } from '@/lib/data/mock-data';
import { cn } from '@/lib/utils';

const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
const resolvedPct = Math.round((dashboardStats.resolvedCases / dashboardStats.totalHotspots) * 100);
const activePMEs = pmeList.filter((p) => p.activeInterventions > 0).length;

const territoireChartData = territoires.map((c) => ({
  name: c.name,
  signales: c.hotspotCount,
  resolus: c.resolvedCount,
}));

const roleCounts = [
  { name: 'Admin',       value: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,   color: '#D94035' },
  { name: 'Superviseur', value: users.filter((u) => u.role === 'SUPERVISOR' || u.role === 'MANAGER').length, color: '#E8A020' },
  { name: 'Agent',       value: users.filter((u) => u.role === 'AGENT').length,                              color: '#2D7D46' },
  { name: 'Citoyen',     value: users.filter((u) => u.role === 'USER').length,                               color: '#6B7280' },
];

const recentHotspots = hotspots.slice(0, 5);
const SEV_COLOR: Record<string, string> = { critical: '#D94035', high: '#E8A020', medium: '#2D7D46', low: '#6B7280' };
const STA_LABEL: Record<string, string> = { reported: 'Signalé', 'in-progress': 'En cours', resolved: 'Résolu' };

// ── Collapsible section wrapper ───────────────────────────────────────────────

function Section({
  title, defaultOpen = true, children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown
          className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function DashboardSummary() {
  return (
    <>
      {/* KPIs */}
      <Section title="Indicateurs clés">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Users}        title="Utilisateurs actifs" value={activeUsers}                        delay={0} />
          <KPICard icon={AlertTriangle} title="Points noirs"        value={dashboardStats.totalHotspots}      delay={0.06} />
          <KPICard icon={CheckCircle}   title="Taux de résolution"  value={resolvedPct}                       delay={0.12} trend={dashboardStats.weeklyTrend} />
          <KPICard icon={Building2}     title="PMEs actives"        value={activePMEs}                        delay={0.18} />
        </div>
      </Section>

      {/* Charts */}
      <Section title="Statistiques">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-4">Signalements par territoire — Répartition Conakry</p>
            <BarChart
              data={territoireChartData}
              xKey="name"
              bars={[
                { dataKey: 'signales', color: '#E8A020', name: 'Signalés' },
                { dataKey: 'resolus',  color: '#6FCF4A', name: 'Résolus' },
              ]}
              height={250}
            />
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-4">Répartition des utilisateurs — Par rôle</p>
            <PieChart data={roleCounts} height={250} />
          </div>
        </div>
      </Section>

      {/* Quick links + recent hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Accès rapide">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Utilisateurs', href: '/admin/users',      icon: Users,         count: users.length },
              { label: 'Territoires',  href: '/admin/territoires', icon: Map,           count: territoires.length },
              { label: 'PME',          href: '/admin/pme',         icon: Building2,     count: pmeList.length },
              { label: 'Signalements', href: '/admin/hotspots',    icon: AlertTriangle, count: hotspots.length },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/30 hover:border-primary/30 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <link.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs font-mono text-muted-foreground">{link.count} éléments</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Signalements récents">
          <div className="-mx-5 -mb-5 divide-y divide-border">
            {recentHotspots.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: SEV_COLOR[h.severity] }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{h.location.address}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{h.location.territoire} · {h.id}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground ml-2 shrink-0">{STA_LABEL[h.status]}</span>
              </div>
            ))}
            <div className="px-5 py-3">
              <Link href="/admin/hotspots" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
                Voir tous <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
