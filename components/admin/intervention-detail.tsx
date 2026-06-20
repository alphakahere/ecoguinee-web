'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText, Phone, ImageIcon, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
import { useIntervention } from '@/hooks/queries/useInterventions';
import { useReport } from '@/hooks/queries/useReports';
import { MapLoader } from '@/components/maps/map-loader';
import { PhotoGallery } from '@/components/shared/photo-gallery';
import { apiReportsToHotspots } from '@/lib/reports-to-hotspots';
import {
  INTERVENTION_STATUS_META,
  SEVERITY_META_API,
  type ApiIntervention,
  type ApiReport,
} from '@/types/api';

export function AdminInterventionDetail({ id }: { id: string }) {
  const { data: rawIntervention, isLoading, isError } = useIntervention(id);
  const intervention = rawIntervention as unknown as ApiIntervention;

  const reportId = intervention?.reportId ?? '';
  const { data: report } = useReport(reportId) as { data: ApiReport | undefined };

  const hotspots = useMemo(
    () => (report ? apiReportsToHotspots([report]) : []),
    [report],
  );

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
        <Link href="/admin/interventions" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Intervention introuvable.</p>
      </div>
    );
  }

  const statusMeta = INTERVENTION_STATUS_META[intervention.status];
  const reportSeverity = intervention.report?.severity ?? report?.severity;
  const severityMeta = reportSeverity ? SEVERITY_META_API[reportSeverity] : null;
  const beforePhotos = report?.photos ?? [];
  const afterPhotos = intervention.photos ?? [];
  const isResolved = intervention.status === 'RESOLVED';
  const photoIcon = <ImageIcon className="w-4 h-4 text-muted-foreground" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/interventions"
          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Interventions
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono">
          {intervention.reference ?? `#INT-${id.slice(0, 6)}`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Signalement lié</h3>
              <Link
                href={`/admin/signalements/${reportId}`}
                className="text-xs font-mono text-primary hover:underline"
              >
                Voir le signalement →
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">
                {intervention.report?.reference ?? `#SIG-${reportId.slice(0, 6)}`}
              </span>
              {severityMeta && (
                <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>
                  {severityMeta.label}
                </Badge>
              )}
              {(intervention.report?.address || intervention.report?.zone?.name) && (
                <span className="text-xs font-mono flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {intervention.report?.address}
                  {intervention.report?.address && intervention.report?.zone?.name && ', '}
                  {intervention.report?.zone?.name}
                </span>
              )}
            </div>

            {(intervention.report?.contactName || intervention.report?.contactPhone) && (
              <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-muted-foreground">
                {intervention.report?.contactName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {intervention.report.contactName}
                  </span>
                )}
                {intervention.report?.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {intervention.report.contactPhone}
                  </span>
                )}
              </div>
            )}

            {intervention.report?.zone && (
              <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {intervention.report.zone.name}
                {intervention.report.zone.parent && (
                  <span className="text-muted-foreground/60"> — {intervention.report.zone.parent.name}</span>
                )}
              </div>
            )}

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

          <PhotoGallery
            photos={beforePhotos}
            title="Photos avant"
            label="Avant"
            icon={photoIcon}
            thumbAspect="square"
            columns={4}
          />
          <PhotoGallery
            photos={afterPhotos}
            title="Photos après"
            label="Après"
            icon={photoIcon}
            thumbAspect="square"
            columns={4}
          />

          {intervention.pvDocument && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Document PV</h3>
              </div>
              <a
                href={getImageUrl(intervention.pvDocument)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-mono truncate flex-1">Procès-verbal de clôture</span>
                <Download className="w-4 h-4 text-primary shrink-0" />
              </a>
            </div>
          )}

          {isResolved && intervention.resolutionNote && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold">Note de clôture</h3>
              <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {intervention.resolutionNote}
              </p>
            </div>
          )}

          {intervention.notes && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold">Plan d&apos;intervention / Notes</h3>
              <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {intervention.notes}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:sticky">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Statut</span>
                <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>
                  {statusMeta.label}
                </Badge>
              </div>
              {severityMeta && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Gravité</span>
                  <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>
                    {severityMeta.label}
                  </Badge>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              {intervention.organization && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{intervention.organization.name}</span>
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
                  <span className="font-mono text-xs">
                    Assigné le {formatDate(intervention.assignedDate)}
                  </span>
                </div>
              )}
              {intervention.resolutionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">
                    Résolu le {formatDate(intervention.resolutionDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">
                  Créé le {formatDate(intervention.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
