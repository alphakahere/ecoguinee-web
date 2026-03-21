'use client';

import Link from 'next/link';
import { Users, FileText } from 'lucide-react';
import type { ApiCampaign } from '@/types/api';
import { API_CAMPAIGN_TYPE_META, API_CAMPAIGN_STATUS_META } from '@/types/api';
import { formatDate } from '@/lib/utils';

const TYPE_EMOJI: Record<string, string> = { AWARENESS: '📢', PROMOTION: '🎯', TRAINING: '📚' };

interface Props {
  campaign: ApiCampaign;
  index?: number;
  basePath?: string;
}

export function CampaignCard({ campaign, index = 0, basePath = '/campagnes' }: Props) {
  const tm = API_CAMPAIGN_TYPE_META[campaign.type];
  const sm = API_CAMPAIGN_STATUS_META[campaign.status];
  const emoji = TYPE_EMOJI[campaign.type] ?? '📋';
  const heroPhoto = campaign.photos?.[0];

  return (
    <Link
      href={`${basePath}/${campaign.id}`}
      className="group block bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,125,70,0.15)] hover:border-primary/45 transition-all duration-250"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={campaign.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, #0A1A10 0%, ${tm.color}44 55%, #0A1A10 100%)` }}
          >
            <span className="text-[3.2rem] drop-shadow-lg">{emoji}</span>
          </div>
        )}

        {heroPhoto && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.6) 0%, transparent 60%)' }} />
        )}

        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
          style={{ background: 'rgba(10,26,16,0.85)', backdropFilter: 'blur(8px)', color: tm.color, border: `1px solid ${tm.color}40` }}
        >
          <span>{emoji}</span>
          <span>{tm.label}</span>
        </div>

        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono"
          style={{ background: 'rgba(10,26,16,0.85)', backdropFilter: 'blur(8px)', color: sm.color.replace('text-', ''), border: `1px solid ${sm.color.replace('text-', '')}40` }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: sm.color.includes('#') ? sm.color.replace('text-', '') : undefined }} />
          {sm.label}
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
