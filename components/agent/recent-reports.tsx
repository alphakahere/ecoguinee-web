'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAgentOverview } from '@/hooks/queries/useAgentDashboard';
import { REPORT_STATUS_META, SEVERITY_META_API, INTERVENTION_STATUS_META } from '@/types/api';

const SEV_COLOR: Record<string, string> = { LOW: '#6B7280', MODERATE: '#E8A020', CRITICAL: '#D94035' };

export function RecentReports() {
  const { data, isLoading } = useAgentOverview();
  const recentReports = data?.recentReports ?? [];
  const myAssigned = data?.myAssigned ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Recent reports */}
      <div className="lg:col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Derniers signalements</h3>
          <Link href="/agent/signalements" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
            Voir tous <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                {['ID', 'Gravité', 'Zone', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReports.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm font-mono text-muted-foreground">Aucun signalement</td></tr>
              ) : recentReports.map((r) => {
                const sevMeta = SEVERITY_META_API[r.severity as keyof typeof SEVERITY_META_API];
                const stMeta = REPORT_STATUS_META[r.status as keyof typeof REPORT_STATUS_META];
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{sevMeta && <Badge className={`${sevMeta.bg} ${sevMeta.color} border-0`}>{sevMeta.label}</Badge>}</td>
                    <td className="px-4 py-3 text-xs font-mono">{r.zone?.name ?? '—'}</td>
                    <td className="px-4 py-3">{stMeta && <Badge className={`${stMeta.bg} ${stMeta.color} border-0`}>{stMeta.label}</Badge>}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{formatDate(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned interventions */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Mes interventions</h3>
          <Link href="/agent/interventions" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
            Voir toutes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {myAssigned.length === 0 ? (
            <p className="text-sm font-mono text-muted-foreground text-center py-8">Aucune intervention</p>
          ) : myAssigned.map((iv) => {
            const sMeta = INTERVENTION_STATUS_META[iv.status as keyof typeof INTERVENTION_STATUS_META];
            return (
              <div key={iv.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{iv.address ?? iv.reportId.slice(0, 8)}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{iv.smeName ?? '—'}</p>
                </div>
                {sMeta && <Badge className={`${sMeta.bg} ${sMeta.color} border-0 shrink-0`}>{sMeta.label}</Badge>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
