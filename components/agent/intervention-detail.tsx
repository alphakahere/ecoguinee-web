'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText, Phone, ImageIcon, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
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

  const serverNotes = intervention?.notes ?? '';
  const [draftNotes, setDraftNotes] = useState<string | null>(null);
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setDraftNotes(null);
  }
  const notes = draftNotes ?? serverNotes;
  const setNotes = (value: string | ((prev: string) => string)) => {
    setDraftNotes((prev) => {
      const base = prev ?? serverNotes;
      return typeof value === 'function' ? (value as (p: string) => string)(base) : value;
    });
  };

  const updateIntervention = useUpdateIntervention();

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  async function handleSave() {
    try {
      await updateIntervention.mutateAsync({ id, payload: { notes } as never });
      setDraftNotes(null);
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
  const photos = intervention.photos ?? [];
  const isResolved = intervention.status === 'RESOLVED';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/agent/interventions" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Interventions
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono">{intervention.reference ?? `#INT-${id.slice(0, 6)}`}</span>
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
              <span className="text-xs font-mono text-muted-foreground">
                {intervention.report?.reference ?? `#SIG-${reportId.slice(0, 6)}`}
              </span>
              {severityMeta && (
                <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>{severityMeta.label}</Badge>
              )}
              {intervention.report?.address || intervention.report?.zone?.name && (
                <span className="text-xs font-mono flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {intervention.report.address}, {intervention.report.zone?.name}
                </span>
              )}
            </div>

            {/* Contact info */}
            {(intervention.report?.contactName || intervention.report?.contactPhone) && (
              <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-muted-foreground">
                {intervention.report.contactName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {intervention.report.contactName}
                  </span>
                )}
                {intervention.report.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {intervention.report.contactPhone}
                  </span>
                )}
              </div>
            )}

            {/* Zone */}
            {intervention.report?.zone && (
              <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {intervention.report.zone.name}
                {intervention.report.zone.parent && (
                  <span className="text-muted-foreground/60"> — {intervention.report.zone.parent.name}</span>
                )}
              </div>
            )}

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

          {/* Photos */}
          {photos.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Photos ({photos.length})</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIdx(i)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                  >
                    <Image
                      src={getImageUrl(url)}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PV Document */}
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

          {/* Resolution note */}
          {isResolved && intervention.resolutionNote && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold">Note de clôture</h3>
              <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {intervention.resolutionNote}
              </p>
            </div>
          )}

          {/* Notes / Plan d'intervention */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Plan d&apos;intervention / Notes</h3>
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
                  <span className="font-mono text-xs">Assigné le {formatDate(intervention.assignedDate)}</span>
                </div>
              )}
              {intervention.resolutionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">Résolu le {formatDate(intervention.resolutionDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">Créé le {formatDate(intervention.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="relative max-w-3xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(photos[lightboxIdx])}
              alt={`Photo ${lightboxIdx + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">{lightboxIdx + 1} / {photos.length}</span>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((lightboxIdx + 1) % photos.length)}
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
