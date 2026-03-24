'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useIntervention } from '@/hooks/queries/useInterventions';
import { useReport } from '@/hooks/queries/useReports';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { MapLoader } from '@/components/maps/map-loader';
import { apiReportsToHotspots } from '@/lib/reports-to-hotspots';
import {
  INTERVENTION_STATUS_META,
  SEVERITY_META_API,
  type ApiIntervention,
} from '@/types/api';
import type { ApiReport } from '@/types/api';

export function InterventionDetail({ id }: { id: string }) {
  const { data: rawIntervention, isLoading, isError } = useIntervention(id);
  const intervention = rawIntervention as unknown as ApiIntervention;

  const reportId = intervention?.reportId ?? '';
  const { data: report } = useReport(reportId) as { data: ApiReport | undefined };

  const hotspots = useMemo(
    () => (report ? apiReportsToHotspots([report]) : []),
    [report],
  );

  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (intervention?.notes) setNotes(intervention.notes);
  }, [intervention?.notes]);

  const updateIntervention = useUpdateIntervention();

  async function handleSave() {
    try {
      await updateIntervention.mutateAsync({ id, payload: { notes } as never });
      toast.success('Notes enregistrées');
    } catch {
      toast.error('Impossible d\'enregistrer');
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !intervention) {
    return (
      <div className="space-y-4">
        <Link href="/agent/interventions" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Intervention introuvable.</p>
      </div>
    );
  }

  const statusMeta = INTERVENTION_STATUS_META[intervention.status];
  const reportSeverity = intervention.report?.severity;
  const severityMeta = reportSeverity ? SEVERITY_META_API[reportSeverity] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/agent/interventions" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Interventions
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono">#INT-{id.slice(0, 6)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Signalement lié */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Signalement lié</h3>
              <Link href={`/agent/signalements/${reportId}`} className="text-xs font-mono text-primary hover:underline">
                Voir le signalement →
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">#SIG-{reportId.slice(0, 6)}</span>
              {severityMeta && (
                <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>{severityMeta.label}</Badge>
              )}
              {intervention.report?.address && (
                <span className="text-xs font-mono flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {intervention.report.address}
                </span>
              )}
            </div>

            {/* Map */}
            {report && (
              <div className="overflow-hidden rounded-xl border border-border h-56">
                <MapLoader
                  hotspots={hotspots}
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>

          {/* Notes / Plan d'intervention */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Plan d'intervention / Notes</h3>
            <textarea
              className="w-full min-h-[140px] resize-y px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Décrivez le plan d'action, observations, obstacles…"
            />
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={updateIntervention.isPending}
                className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {updateIntervention.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        {/* Right — info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:sticky lg:top-24">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Statut</span>
                <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>{statusMeta.label}</Badge>
              </div>
              {severityMeta && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Gravité</span>
                  <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>{severityMeta.label}</Badge>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              {intervention.sme && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{intervention.sme.name}</span>
                </div>
              )}
              {intervention.agent && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{intervention.agent.name}</span>
                </div>
              )}
              {intervention.assignedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">Assigné le {formatDate(intervention.assignedDate)}</span>
                </div>
              )}
              {intervention.resolutionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">Résolu le {formatDate(intervention.resolutionDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
