'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Megaphone, MapPin, Calendar } from 'lucide-react';
import type { ApiCampaign } from '@/types/api';
import { formatDate, getImageUrl } from '@/lib/utils';

interface Props {
  campaign: ApiCampaign;
  index?: number;
  basePath?: string;
}

export function CampaignCard({ campaign, index = 0, basePath = '/campagnes' }: Props) {
  const heroPhoto = getImageUrl(campaign.photos?.[0]);
  return (
    <Link
      href={`${basePath}/${campaign.slug ?? campaign.id}`}
      className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,125,70,0.15)] hover:border-primary/45 transition-all duration-250 h-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={campaign.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
            unoptimized
          />
        ) : (
          <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-linear-to-br from-[#0A1A10] via-[#0f2415] to-[#0A1A10]"
          >
              <Megaphone className="h-14 w-14 text-primary/25" strokeWidth={1.25} aria-hidden />
          </div>
        )}

        {heroPhoto && (
          <div className="absolute inset-0 pointer-events-none z-1" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.6) 0%, transparent 60%)' }} />
        )}
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-bold line-clamp-2 text-base leading-snug">{campaign.title}</h3>
        <p className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{campaign.address || campaign.zone?.name || '—'}</span>
        </p>
        <p className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {formatDate(campaign.scheduledDate)}
        </p>
      </div>
    </Link>
  );
}
