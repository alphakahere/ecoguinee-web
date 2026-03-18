'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, FileText } from 'lucide-react';
import { type Campaign, CAMP_TYPE_META, CAMP_STATUS_META } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const DOC_BY_TYPE: Record<string, number> = {
  sensibilisation: 2,
  promotion: 3,
  formation: 5,
};

interface Props {
  campaign: Campaign;
  index?: number;
}

export function CampaignCard({ campaign, index = 0 }: Props) {
  const tm = CAMP_TYPE_META[campaign.type];
  const sm = CAMP_STATUS_META[campaign.statut];
  const docCount = campaign.documents?.length ?? DOC_BY_TYPE[campaign.type];
  const heroPhoto = campaign.photos?.[0]?.url;

  return (
    <Link
      href={`/campagnes/${campaign.id}`}
      className="group block bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,125,70,0.15)] hover:border-primary/45 transition-all duration-250"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={campaign.titre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, #0A1A10 0%, ${tm.color}44 55%, #0A1A10 100%)` }}
          >
            <span className="text-[3.2rem] drop-shadow-lg">{tm.emoji}</span>
          </div>
        )}

        {heroPhoto && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.6) 0%, transparent 60%)' }} />
        )}

        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
          style={{ background: 'rgba(10,26,16,0.85)', backdropFilter: 'blur(8px)', color: tm.color, border: `1px solid ${tm.color}40` }}
        >
          <span>{tm.emoji}</span>
          <span>{tm.label}</span>
        </div>

        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono"
          style={{ background: 'rgba(10,26,16,0.85)', backdropFilter: 'blur(8px)', color: sm.dot, border: `1px solid ${sm.dot}40` }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
          {sm.label}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-bold line-clamp-2 text-base leading-snug">{campaign.titre}</h3>
        <p className="text-xs font-mono text-muted-foreground">
          {campaign.secteur}<span className="opacity-40 mx-1">·</span>{campaign.commune}
        </p>
        <p className="text-xs font-mono text-muted-foreground">{formatDate(campaign.datePrevue)}</p>
      </div>

      <div className="flex items-stretch border-t border-border">
        <div className="flex items-center gap-2 px-5 py-3 flex-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground">{campaign.participants ?? 0} participants</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 flex-1 border-l border-border">
          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground">{docCount} documents</span>
        </div>
      </div>
    </Link>
  );
}
