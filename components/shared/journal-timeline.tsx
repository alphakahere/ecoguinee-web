'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, Calendar, X, Pencil, Trash2 } from 'lucide-react';
import { formatDate, getImageUrl } from '@/lib/utils';
import type { InterventionJournalEntry } from '@/types/api';

interface Props {
  updates: InterventionJournalEntry[];
  emptyLabel?: string;
  /** Viewer's user id — used together with `onEdit`/`onDelete` to show the buttons only on the viewer's own entries. */
  currentUserId?: string;
  /** When the timeline is allowed to expose editing UI (e.g. intervention not closed). Caller decides. */
  onEdit?: (entry: InterventionJournalEntry) => void;
  /** Same gating as `onEdit`. Caller is responsible for confirming destructive action. */
  onDelete?: (entry: InterventionJournalEntry) => void;
}

export function JournalTimeline({
  updates,
  emptyLabel = 'Aucune entrée pour le moment.',
  currentUserId,
  onEdit,
  onDelete,
}: Props) {
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);

  if (updates.length === 0) {
    return <p className="text-xs font-mono text-muted-foreground">{emptyLabel}</p>;
  }

  const sorted = [...updates].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
  );

  return (
    <>
      <div className="space-y-3">
        {sorted.map((u) => {
          const postedLate = u.createdAt.slice(0, 10) !== u.entryDate.slice(0, 10);
          const wasEdited =
            new Date(u.updatedAt).getTime() - new Date(u.createdAt).getTime() >
            5000;
          const isOwnEntry = Boolean(
            currentUserId && u.agentId === currentUserId,
          );
          const canEdit = Boolean(onEdit && isOwnEntry);
          const canDelete = Boolean(onDelete && isOwnEntry);
          return (
            <div
              key={u.id}
              className="rounded-xl border border-border bg-background p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  {u.agent?.name ?? '—'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Calendar className="w-3 h-3" />
                      Travail du {formatDate(u.entryDate)}
                    </span>
                    {postedLate && (
                      <span className="text-[9px] text-muted-foreground/70">
                        posté le {formatDate(u.createdAt)}
                      </span>
                    )}
                    {wasEdited && (
                      <span className="text-[9px] text-muted-foreground/70 italic">
                        modifié le {formatDate(u.updatedAt)}
                      </span>
                    )}
                  </span>
                  {(canEdit || canDelete) && (
                    <span className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(u)}
                          aria-label="Modifier l'entrée"
                          className="rounded-md p-1 hover:bg-muted transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(u)}
                          aria-label="Supprimer l'entrée"
                          className="rounded-md p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {u.note}
              </p>
              {u.photos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {u.photos.map((src, i) => {
                    const resolved = getImageUrl(src);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setLightbox({
                            images: u.photos.map(getImageUrl),
                            idx: i,
                          })
                        }
                        className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors w-32 h-20"
                      >
                        <Image
                          src={resolved}
                          alt={`Photo ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
              unoptimized
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
