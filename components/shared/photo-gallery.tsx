'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface PhotoGalleryProps {
  photos: string[];
  /** Card heading text (the count is appended automatically). */
  title?: string;
  /** Optional icon rendered before the title. */
  icon?: ReactNode;
  /** Thumbnail aspect ratio. */
  thumbAspect?: 'video' | 'square';
  /** Max columns at the largest breakpoint. */
  columns?: 3 | 4;
  /** Pass through to next/image — needed for API-served photos. */
  unoptimized?: boolean;
}

const GRID_CLS: Record<3 | 4, string> = {
  3: 'grid grid-cols-2 sm:grid-cols-3 gap-3',
  4: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2',
};

const ASPECT_CLS: Record<'video' | 'square', string> = {
  video: 'aspect-video',
  square: 'aspect-square',
};

export function PhotoGallery({
  photos,
  title = 'Photos',
  icon,
  thumbAspect = 'video',
  columns = 3,
  unoptimized = false,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">
          {title} ({photos.length})
        </h3>
      </div>

      <div className={GRID_CLS[columns]}>
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className={`relative ${ASPECT_CLS[thumbAspect]} w-full rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group`}
          >
            <Image
              src={getImageUrl(url)}
              alt={`${title} ${i + 1}`}
              fill
              quality={100}
              priority={i === 0}
              unoptimized={unoptimized}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="relative max-w-3xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(photos[lightboxIndex])}
              alt={`${title} ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              quality={100}
              unoptimized={unoptimized}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + photos.length) % photos.length,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % photos.length)
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
