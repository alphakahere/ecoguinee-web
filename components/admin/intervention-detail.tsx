'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText, Phone, ImageIcon, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
import { useIntervention } from '@/hooks/queries/useInterventions';
import { useReport } from '@/hooks/queries/useReports';
import { MapLoader } from '@/components/maps/map-loader';
import { apiReportsToHotspots } from '@/lib/reports-to-hotspots';
import {
  INTERVENTION_STATUS_META,
  SEVERITY_META_API,
  type ApiIntervention,
  type ApiReport,
} from '@/types/api';

type LightboxState = { source: 'before' | 'after'; index: number } | null;

export function AdminInterventionDetail({ id }: { id: string }) {
  const { data: rawIntervention, isLoading, isError } = useIntervention(id);
  const intervention = rawIntervention as unknown as ApiIntervention;

  const reportId = intervention?.reportId ?? '';
  const { data: report } = useReport(reportId) as { data: ApiReport | undefined };

  const hotspots = useMemo(
    () => (report ? apiReportsToHotspots([report]) : []),
    [report],
  );

  const [lightbox, setLightbox] = useState<LightboxState>(null);

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
  const activePhotos = lightbox?.source === 'before' ? beforePhotos : afterPhotos;

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

          {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Photos avant / après</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-muted-foreground">
                    Avant intervention
                  </h4>
                  <span className="text-xs font-mono text-muted-foreground">
                    {beforePhotos.length} photo{beforePhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {beforePhotos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightbox({ source: 'before', index: i })}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                      >
                        <Image
                          src={getImageUrl(url)}
                          alt={`Avant ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-muted-foreground py-4">
                    Aucune photo du signalement.
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-muted-foreground">
                    Après intervention
                  </h4>
                  <span className="text-xs font-mono text-muted-foreground">
                    {afterPhotos.length} photo{afterPhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {afterPhotos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightbox({ source: 'after', index: i })}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                      >
                        <Image
                          src={getImageUrl(url)}
                          alt={`Après ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-muted-foreground py-4">
                    Aucune photo de résolution.
                  </p>
                )}
              </div>
            </div>
          )}

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

      {lightbox !== null && activePhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="relative max-w-3xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono">
              {lightbox.source === 'before' ? 'Avant' : 'Après'}
            </div>
            <Image
              src={getImageUrl(activePhotos[lightbox.index])}
              alt={`${lightbox.source === 'before' ? 'Avant' : 'Après'} ${lightbox.index + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {activePhotos.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      source: lightbox.source,
                      index: (lightbox.index - 1 + activePhotos.length) % activePhotos.length,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">
                  {lightbox.index + 1} / {activePhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      source: lightbox.source,
                      index: (lightbox.index + 1) % activePhotos.length,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
