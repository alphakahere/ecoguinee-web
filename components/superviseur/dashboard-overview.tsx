'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flag, Wrench, TrendingUp, Users, ArrowRight,
  AlertTriangle, Clock, CheckCircle, Eye,
  Activity, RefreshCw, UserPlus,
} from 'lucide-react';
import { BarChart } from '@/components/charts/bar-chart';
import {
  PME_REPORTS, AGENTS, ACTIVITY_FEED, MONTHLY_CHART, SUPERVISEUR, PME_PROFILE,
} from '@/lib/data/superviseur-data';
import type { InterventionStatus } from '@/lib/types';

// ── shared styles ─────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, string> = {
  critical: '#D94035', high: '#E8A020', medium: '#2D7D46', low: '#6B7280',
};
const SEV_LABEL: Record<string, string> = {
  critical: 'Critique', high: 'Élevé', medium: 'Moyen', low: 'Faible',
};
const STA_STYLE: Record<string, string> = {
  reported:      'bg-[#D94035]/10 text-[#D94035]',
  'in-progress': 'bg-[#E8A020]/10 text-[#E8A020]',
  resolved:      'bg-[#6FCF4A]/10 text-[#6FCF4A]',
};
const STA_LABEL: Record<string, string> = {
  reported: 'Signalé', 'in-progress': 'En cours', resolved: 'Résolu',
};
const STA_ICON: Record<string, React.ElementType> = {
  reported: AlertTriangle, 'in-progress': Clock, resolved: CheckCircle,
};
const WASTE_ICON: Record<string, string> = { solid: '🗑', liquid: '💧', mixed: '♻️' };
const ACTIVITY_ICON: Record<string, React.ElementType> = {
  report_new: Flag, intervention: RefreshCw, resolved: CheckCircle, agent_new: UserPlus,
};

// ── KPI card ─────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, accent,
  miniBar, progress, delay = 0,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; accent: string;
  miniBar?: { label: string; pct: number; color: string }[];
  progress?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-card rounded-2xl p-4 border border-border grain-overlay"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {progress !== undefined && (
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 40 40" className="w-12 h-12 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--muted)" strokeWidth="3.5" />
              <circle cx="20" cy="20" r="16" fill="none" stroke={accent} strokeWidth="3.5"
                strokeDasharray={`${(progress / 100) * 100.5} 100.5`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold" style={{ color: accent }}>
              {progress}%
            </span>
          </div>
        )}
      </div>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="font-bold text-2xl mb-1" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-muted-foreground">{sub}</p>}
      {miniBar && (
        <div className="mt-3 space-y-1.5">
          {miniBar.map(b => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-14 flex-shrink-0">{b.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
              </div>
              <span className="text-[10px] font-mono" style={{ color: b.color }}>{b.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── inline status badge ───────────────────────────────────────────────────
function StatusPill({ status }: { status: InterventionStatus }) {
  const Icon = STA_ICON[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${STA_STYLE[status]}`}>
      <Icon className="w-3 h-3" /> {STA_LABEL[status]}
    </span>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export function DashboardOverview() {
  const active = PME_REPORTS.filter(h => h.status !== 'resolved').length;
  const inProg = PME_REPORTS.filter(h => h.status === 'in-progress').length;
  const resolved = PME_REPORTS.filter(h => h.status === 'resolved').length;
  const rate = Math.round((resolved / Math.max(PME_REPORTS.length, 1)) * 100);
  const criticals = PME_REPORTS.filter(h => h.severity === 'critical');
  const activeAgents = AGENTS.filter(a => a.active).length;

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl mb-1">
              Bonjour, {SUPERVISEUR.firstName} 👋
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PME_PROFILE.secteurs.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-[10px] font-mono text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI cards — 4 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          icon={Flag} label="Signalements actifs" value={active}
          sub={`${criticals.length} critique${criticals.length > 1 ? 's' : ''} non traité${criticals.length > 1 ? 's' : ''}`}
          accent="#D94035" delay={0}
          miniBar={[
            { label: 'Critique', pct: Math.round((criticals.length / Math.max(active, 1)) * 100), color: '#D94035' },
            { label: 'Élevé', pct: Math.round((PME_REPORTS.filter(h => h.severity === 'high' && h.status !== 'resolved').length / Math.max(active, 1)) * 100), color: '#E8A020' },
            { label: 'Faible', pct: Math.round((PME_REPORTS.filter(h => h.severity === 'low' && h.status !== 'resolved').length / Math.max(active, 1)) * 100), color: '#2D7D46' },
          ]}
        />
        <KpiCard
          icon={Wrench} label="Interventions en cours" value={inProg}
          sub="Délai moyen : 2.4 jours · 78% dans les délais"
          accent="#E8A020" delay={0.06}
        />
        <KpiCard
          icon={TrendingUp} label="Performance PME" value={`${rate}%`}
          sub={criticals.filter(h => h.status === 'reported').length > 0 ? `⚠ ${criticals.filter(h => h.status === 'reported').length} en retard` : 'Aucun retard ce mois'}
          accent="#6FCF4A" delay={0.12} progress={rate}
        />
        <KpiCard
          icon={Users} label="Agents actifs" value={activeAgents}
          sub={`${AGENTS.length - activeAgents} inactif · ${inProg} interventions aujourd'hui`}
          accent="#2D7D46" delay={0.18}
        />
      </div>

      {/* ROW 2: Recent reports + Activity feed */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Left: Signalements récents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="xl:col-span-3 bg-card rounded-2xl border border-border grain-overlay overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Signalements récents</h3>
            <Link href="/superviseur/signalements" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
              Voir tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/20 border-b border-border">
                  {['ID', 'Secteur', 'Type', 'Gravité', 'Statut', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PME_REPORTS.slice(0, 5).map(hs => (
                  <tr
                    key={hs.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                      hs.severity === 'critical' && hs.status === 'reported' ? 'bg-[#D94035]/3 border-l-2 border-l-[#D94035]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{hs.id}</td>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">{hs.location.sector}</td>
                    <td className="px-4 py-3 text-xs font-mono">{WASTE_ICON[hs.wasteType]}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: SEV_COLOR[hs.severity] }} />
                        <span className="text-[10px] font-mono" style={{ color: SEV_COLOR[hs.severity] }}>{SEV_LABEL[hs.severity]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={hs.status} /></td>
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(hs.reportedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/superviseur/signalements" title="Voir détail">
                        <span className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors inline-flex">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right: Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-card rounded-2xl border border-border grain-overlay overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Activité récente</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{ACTIVITY_FEED.length} actions</span>
          </div>
          <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: 340 }}>
            {ACTIVITY_FEED.map(a => {
              const Icon = ACTIVITY_ICON[a.type] ?? Activity;
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${a.color}18` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono leading-snug">{a.text}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ROW 3: Assigned reports + Agent performance */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Signalements assignés */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="xl:col-span-3 bg-card rounded-2xl border border-border grain-overlay overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Signalements assignés</h3>
            <Link href="/superviseur/signalements" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
              Voir tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/20 border-b border-border">
                  {['ID', 'Secteur', 'Agent', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PME_REPORTS.filter(h => h.assignedTo).slice(0, 4).map(hs => (
                  <tr key={hs.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{hs.id}</td>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">{hs.location.sector}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[100px]">
                      {hs.assignedTo ?? '—'}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={hs.status} /></td>
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(hs.reportedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/superviseur/signalements">
                        <span className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors inline-flex">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Agent performance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-card rounded-2xl border border-border grain-overlay overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Performance Agents</h3>
            <Link href="/superviseur/agents" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {AGENTS.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${a.active ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                  {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold truncate">{a.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2 flex-shrink-0">{a.rate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-[#6FCF4A] transition-all" style={{ width: `${a.rate}%` }} />
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${a.active ? 'bg-[#6FCF4A]/10 text-[#6FCF4A]' : 'bg-muted text-muted-foreground'}`}>
                      {a.active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-card rounded-2xl p-5 border border-border grain-overlay"
      >
        <h3 className="font-semibold mb-1">Signalements reçus vs résolus</h3>
        <p className="text-xs font-mono text-muted-foreground mb-4">7 derniers mois · {PME_PROFILE.name}</p>
        <BarChart
          data={MONTHLY_CHART}
          xKey="mois"
          bars={[
            { dataKey: 'recus', color: '#E8A020', name: 'Reçus' },
            { dataKey: 'resolus', color: '#6FCF4A', name: 'Résolus' },
          ]}
          height={180}
        />
      </motion.div>
    </div>
  );
}
