'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle, Building2, Map as MapIcon, ArrowRight, ChevronDown } from 'lucide-react';
import { KPICard } from '@/components/shared/kpi-card';
import { PieChart } from '@/components/charts/pie-chart';
import { cn, formatDate } from '@/lib/utils';
import { useDashboardOverview } from '@/hooks/queries/useDashboard';
import { useReports } from '@/hooks/queries/useReports';
import { REPORT_STATUS_META } from '@/types/api';

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

// ── Role label mapping ────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Admin',
  ADMIN: 'Admin',
  MANAGER: 'Superviseur',
  SUPERVISOR: 'Superviseur',
  AGENT: 'Agent',
  USER: 'Citoyen',
};

const ROLE_COLORS: Record<string, string> = {
  Admin: '#D94035',
  Superviseur: '#E8A020',
  Agent: '#2D7D46',
  Citoyen: '#6B7280',
};

const SEV_COLOR: Record<string, string> = {
  LOW: '#6B7280',
  MODERATE: '#E8A020',
  CRITICAL: '#D94035',
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function DashboardSummary() {
  const { data, isLoading } = useDashboardOverview();

  const counts = data?.counts;
  const resolutionRate = data?.resolutionRate ?? 0;
  const recent = data?.recentReports ?? [];

  // Aggregate roles into display groups
  const roleMap = new Map<string, number>();
  for (const r of data?.roleDistribution ?? []) {
    const label = ROLE_LABELS[r.role] ?? r.role;
    roleMap.set(label, (roleMap.get(label) ?? 0) + r.count);
  }
  const roleCounts = Array.from(roleMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: ROLE_COLORS[name] ?? '#6B7280',
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Unhandled reports alert */}
      <UnhandledReportsAlert />

      {/* KPIs */}
      <Section title="Indicateurs clés">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Users}         title="Utilisateurs"    value={counts?.users ?? 0}    delay={0} />
          <KPICard icon={AlertTriangle} title="Signalements"    value={counts?.reports ?? 0}  delay={0.06} />
          <KPICard icon={CheckCircle}   title="Taux résolution" value={resolutionRate}         delay={0.12} />
          <KPICard icon={Building2}     title="Organisations actives"    value={counts?.organizations ?? 0}     delay={0.18} />
        </div>
      </Section>

      {/* Charts */}
      {roleCounts.length > 0 && (
        <Section title="Statistiques">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-4">Répartition des utilisateurs — Par rôle</p>
            <PieChart data={roleCounts} height={250} />
          </div>
        </Section>
      )}

      {/* Quick links + recent hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Accès rapide">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Utilisateurs', href: '/admin/users',       icon: Users,         count: counts?.users ?? 0 },
              { label: 'Territoires',  href: '/admin/territoires', icon: MapIcon,      count: '—' },
              { label: 'Organisations', href: '/admin/organisations', icon: Building2, count: counts?.organizations ?? 0 },
              { label: 'Signalements', href: '/admin/hotspots',    icon: AlertTriangle, count: counts?.reports ?? 0 },
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
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono px-5 py-6 text-center">Aucun signalement</p>
            ) : recent.map((r) => {
              const statusMeta = REPORT_STATUS_META[r.status as keyof typeof REPORT_STATUS_META];
              return (
                <Link
                  key={r.id}
                  href={`/admin/signalements/${r.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: SEV_COLOR[r.severity] ?? '#6B7280' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{r.address ?? r.zone?.name ?? r.id.slice(0, 8)}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{r.zone?.name ?? '—'} · {formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-mono ml-2 shrink-0', statusMeta?.color)}>
                    {statusMeta?.label}
                  </span>
                </Link>
              );
            })}
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

function UnhandledReportsAlert() {
  const { data, isLoading } = useReports({
    status: 'REPORTED',
    olderThan: '24h',
    page: 1,
    limit: 1,
  });

  if (isLoading || !data || data.total === 0) return null;

  return (
    <Link
      href="/admin/signalements?status=REPORTED&olderThan=24h"
      className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 hover:bg-amber-500/10 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
          {data.total} signalement{data.total !== 1 ? 's' : ''} sans prise en charge depuis plus de 24h
        </p>
        <p className="text-xs font-mono text-muted-foreground">Cliquez pour voir les détails</p>
      </div>
      <ArrowRight className="w-4 h-4 text-amber-500 ml-auto" />
    </Link>
  );
}
