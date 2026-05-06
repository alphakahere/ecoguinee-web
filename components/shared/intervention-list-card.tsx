'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  FileText,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, getImageUrl } from '@/lib/utils';
import {
  INTERVENTION_STATUS_META,
  type ApiIntervention,
  type ApiInterventionStatus,
} from '@/types/api';

const INTERVENTION_STATUS_PRIORITY: Record<ApiInterventionStatus, number> = {
  IN_PROGRESS: 0,
  ASSIGNED: 1,
  RESOLVED: 2,
  FAILED: 3,
  CANCELLED: 4,
};

interface InterventionListCardProps {
  interventions: ApiIntervention[];
  renderSecondary: (iv: ApiIntervention) => React.ReactNode;
  detailHrefPrefix?: string;
  titleAction?: React.ReactNode;
  headerExtras?: React.ReactNode;
}

export function InterventionListCard({
  interventions,
  renderSecondary,
  detailHrefPrefix,
  titleAction,
  headerExtras,
}: InterventionListCardProps) {
  const sortedInterventions = useMemo<ApiIntervention[]>(() => {
    return [...interventions].sort((a, b) => {
      const diff =
        INTERVENTION_STATUS_PRIORITY[a.status] - INTERVENTION_STATUS_PRIORITY[b.status];
      if (diff !== 0) return diff;
      const aDate = a.assignedDate ?? a.createdAt;
      const bDate = b.assignedDate ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [interventions]);

  const topInterventionId = sortedInterventions[0]?.id;
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);

  const isInterventionExpanded = (interventionId: string) =>
    expandedOverrides[interventionId] ?? interventionId === topInterventionId;
  const toggleIntervention = (interventionId: string) =>
    setExpandedOverrides((prev) => ({
      ...prev,
      [interventionId]: !isInterventionExpanded(interventionId),
    }));

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="text-sm font-semibold">
            Interventions
            {sortedInterventions.length > 0 && (
              <span className="ml-2 text-xs font-mono text-muted-foreground">
                ({sortedInterventions.length})
              </span>
            )}
          </h3>
          {titleAction}
        </div>

        {headerExtras}

        {sortedInterventions.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono">
            Aucune intervention liée
          </p>
        ) : (
          <div className="space-y-2">
            {sortedInterventions.map((iv) => {
              const sMeta = INTERVENTION_STATUS_META[iv.status];
              const expanded = isInterventionExpanded(iv.id);
              const photos = iv.photos ?? [];
              const isResolved = iv.status === 'RESOLVED';
              const hasDetails =
                Boolean(iv.assignedDate) ||
                Boolean(iv.resolutionDate) ||
                Boolean(iv.notes) ||
                photos.length > 0 ||
                Boolean(iv.pvDocument) ||
                Boolean(iv.resolutionNote);
              return (
                <div
                  key={iv.id}
                  className={`rounded-xl border bg-background overflow-hidden ${
                    isResolved && expanded ? 'border-green-500/30' : 'border-border'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIntervention(iv.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge className={`${sMeta.bg} ${sMeta.color} border-0 shrink-0`}>
                        {sMeta.label}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs font-mono truncate">
                          {iv.reference ?? `#INT-${iv.id.slice(0, 6)}`}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                          {renderSecondary(iv)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                        {iv.assignedDate
                          ? formatDate(iv.assignedDate)
                          : formatDate(iv.createdAt)}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expanded && (
                    <div
                      className={`px-4 pb-4 pt-3 space-y-4 border-t ${
                        isResolved
                          ? 'border-green-500/20 bg-green-500/5'
                          : 'border-border'
                      }`}
                    >
                      {(iv.assignedDate || iv.resolutionDate) && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-mono">
                          {iv.assignedDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground uppercase">
                                Assignée
                              </span>
                              <span>{formatDate(iv.assignedDate)}</span>
                            </div>
                          )}
                          {iv.resolutionDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground uppercase">
                                Résolue
                              </span>
                              <span>{formatDate(iv.resolutionDate)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {iv.notes && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            Notes
                          </span>
                          <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {iv.notes}
                          </p>
                        </div>
                      )}

                      {photos.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            Photos ({photos.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {photos.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setLightbox({
                                    images: photos.map(getImageUrl),
                                    idx: i,
                                  })
                                }
                                className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors w-40 h-28"
                              >
                                <Image
                                  src={getImageUrl(url)}
                                  alt={`Photo ${i + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {iv.pvDocument && (
                        <a
                          href={getImageUrl(iv.pvDocument)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-mono truncate flex-1">
                            Procès-verbal de clôture
                          </span>
                          <Download className="w-4 h-4 shrink-0" />
                        </a>
                      )}

                      {iv.resolutionNote && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            Note de clôture
                          </span>
                          <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {iv.resolutionNote}
                          </p>
                        </div>
                      )}

                      {!hasDetails && (
                        <p className="text-xs font-mono text-muted-foreground">
                          Aucun détail supplémentaire pour le moment.
                        </p>
                      )}

                      {detailHrefPrefix && (
                        <div className="pt-1">
                          <Link
                            href={`${detailHrefPrefix}/${iv.id}`}
                            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
                          >
                            Voir page complète
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightbox && (
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
            <Image
              src={lightbox.images[lightbox.idx]}
              alt=""
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {lightbox.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            idx:
                              (prev.idx - 1 + prev.images.length) % prev.images.length,
                          }
                        : null,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">
                  {lightbox.idx + 1} / {lightbox.images.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? { ...prev, idx: (prev.idx + 1) % prev.images.length }
                        : null,
                    )
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
    </>
  );
}
