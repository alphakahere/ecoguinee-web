'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, FileText, Megaphone } from 'lucide-react';
import type { ApiCampaign } from '@/types/api';
import { API_CAMPAIGN_TYPE_META, API_CAMPAIGN_STATUS_META } from '@/types/api';
import { formatDate, cn, getImageUrl } from '@/lib/utils';

/** Shared pill style for type + status — only semantic colors differ */
const tagClass =
  'z-10 inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold tracking-wide shadow-sm bg-primary text-white';

interface Props {
  campaign: ApiCampaign;
  index?: number;
  basePath?: string;
}

export function CampaignCard({ campaign, index = 0, basePath = '/campagnes' }: Props) {
  const tm = API_CAMPAIGN_TYPE_META[campaign.type];
  const sm = API_CAMPAIGN_STATUS_META[campaign.status];
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

        <div className="flex items-center gap-2 absolute top-3 left-3">
          <div className={cn(tagClass)}>
            {tm.label}
        </div>

          <div className={cn(tagClass)}>
          {sm.label}
        </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-bold line-clamp-2 text-base leading-snug">{campaign.title}</h3>
        <p className="text-xs font-mono text-muted-foreground">
          {campaign.zone?.name ?? '—'}
        </p>
        <p className="text-xs font-mono text-muted-foreground">{formatDate(campaign.scheduledDate)}</p>
      </div>

      <div className="flex items-stretch border-t border-border">
        <div className="flex items-center gap-2 px-5 py-3 flex-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground">{campaign.participantCount ?? 0} participants</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 flex-1 border-l border-border">
          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground">{campaign.documents?.length ?? 0} documents</span>
        </div>
      </div>
    </Link>
  );
}
