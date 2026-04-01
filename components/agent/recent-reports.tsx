'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useAgentOverview } from '@/hooks/queries/useAgentDashboard';
import { REPORT_STATUS_META, SEVERITY_META_API, INTERVENTION_STATUS_META } from '@/types/api';

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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/20">
              {['ID', 'Gravité', 'Zone', 'Statut', 'Date'].map((h) => (
                <TableHead key={h} className="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wide">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentReports.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm font-mono text-muted-foreground">Aucun signalement</TableCell></TableRow>
            ) : recentReports.map((r) => {
              const sevMeta = SEVERITY_META_API[r.severity as keyof typeof SEVERITY_META_API];
              const stMeta = REPORT_STATUS_META[r.status as keyof typeof REPORT_STATUS_META];
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{r.id.slice(0, 8)}</TableCell>
                  <TableCell>{sevMeta && <Badge className={`${sevMeta.bg} ${sevMeta.color} border-0`}>{sevMeta.label}</Badge>}</TableCell>
                  <TableCell className="text-xs font-mono">{r.zone?.name ?? '—'}</TableCell>
                  <TableCell>{stMeta && <Badge className={`${stMeta.bg} ${stMeta.color} border-0`}>{stMeta.label}</Badge>}</TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
                  <p className="text-[10px] font-mono text-muted-foreground">{iv.organizationName ?? '—'}</p>
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
