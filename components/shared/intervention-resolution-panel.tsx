'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, FileText, Download, X } from 'lucide-react';
import { formatDate, getImageUrl } from '@/lib/utils';
import type { ApiIntervention } from '@/types/api';

interface Props {
  intervention: ApiIntervention | null | undefined;
}

export function InterventionResolutionPanel({ intervention }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<{ images: string[]; idx: number } | null>(null);

  if (!intervention || intervention.status !== 'RESOLVED') return null;

  const photos = intervention.photos ?? [];

  return (
    <>
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 space-y-5">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">Résolution</h3>
          {intervention.resolutionDate && (
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              {formatDate(intervention.resolutionDate)}
            </span>
          )}
        </div>

        {photos.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Photos</span>
            <div className="flex flex-wrap gap-1.5">
              {photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setLightboxSrc({
                      images: photos.map(getImageUrl),
                      idx: i,
                    })
                  }
                  className="relative aspect-video rounded-lg overflow-hidden border border-green-500/30 hover:border-green-500 transition-colors w-64 h-44"
                >
                  <Image src={getImageUrl(url)} alt={`Après ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {intervention.pvDocument && (
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Document PV</span>
            <a
              href={getImageUrl(intervention.pvDocument)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500/20 bg-white/50 dark:bg-white/5 hover:bg-green-500/10 transition-colors"
            >
              <FileText className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-sm font-mono truncate flex-1">Procès-verbal de clôture</span>
              <Download className="w-4 h-4 text-green-600 shrink-0" />
            </a>
          </div>
        )}

        {intervention.resolutionNote && (
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Note de clôture</span>
            <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed bg-white/50 dark:bg-white/5 rounded-xl px-4 py-3 border border-border">
              {intervention.resolutionNote}
            </p>
          </div>
        )}
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative max-w-3xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxSrc.images[lightboxSrc.idx]}
              alt=""
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {lightboxSrc.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxSrc((prev) =>
                      prev
                        ? {
                            ...prev,
                            idx: (prev.idx - 1 + prev.images.length) % prev.images.length,
                          }
                        : null,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">
                  {lightboxSrc.idx + 1} / {lightboxSrc.images.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxSrc((prev) =>
                      prev ? { ...prev, idx: (prev.idx + 1) % prev.images.length } : null,
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
