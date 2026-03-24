'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Calendar, Building2, Users, FileText, Camera, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { API_CAMPAIGN_TYPE_META, API_CAMPAIGN_STATUS_META } from '@/types/api';
import { documentLabel, formatDate, getDocumentUrl, getImageUrl } from '@/lib/utils';

const TYPE_EMOJI: Record<string, string> = { AWARENESS: '📢', PROMOTION: '🎯', TRAINING: '📚' };

interface Props { id: string; basePath?: string; }

export function CampaignDetailView({ id, basePath = '/campagnes' }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { data: campaign, isLoading, isError } = useCampaign(id);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <p className="font-mono text-muted-foreground">Campagne introuvable.</p>
        <Link href={basePath} className="text-sm font-mono" style={{ color: '#2D7D46' }}>
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  const tm = API_CAMPAIGN_TYPE_META[campaign.type];
  const sm = API_CAMPAIGN_STATUS_META[campaign.status];
  const emoji = TYPE_EMOJI[campaign.type] ?? '📋';
  const heroPhoto = getImageUrl(campaign.photos?.[0]);
  const isCompleted = campaign.status === 'COMPLETED';

  return (
    <>
      {/* Back */}
      <div className="max-w-7xl mx-auto px-5 pt-8">
        <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux campagnes
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden mt-5" style={{ height: 'clamp(240px, 40vw, 360px)' }}>
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={campaign.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0F1F15 0%, #2D7D46 60%, #0F1F15 100%)` }}>
            <span style={{ fontSize: '6rem', opacity: 0.35 }}>{emoji}</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.9) 0%, rgba(10,26,16,0.3) 50%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-5 pb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${tm.bg} ${tm.color}`}>
              {emoji} {tm.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${sm.bg} ${sm.color}`}>
              {sm.label}
            </span>
          </div>
          <h1 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.4rem,3.5vw,2.25rem)', lineHeight: 1.2 }}>
            {campaign.title}
          </h1>
          <p className="font-mono text-sm" style={{ color: '#6FCF4A' }}>
            {campaign.zone?.name ?? '—'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          <div className="flex flex-col gap-10 bg-white p-4 rounded-2xl border border-border">
            {campaign.description && (
              <section>
                <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>À propos</h2>
                <p className="font-mono text-muted-foreground whitespace-pre-wrap" style={{ fontSize: '0.95rem', lineHeight: 1.75 }}>{campaign.description}</p>
              </section>
            )}

            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Résultats</h2>
              {isCompleted ? (
                <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ borderLeft: '3px solid #6FCF4A', background: 'rgba(111,207,74,0.05)', border: '1px solid rgba(111,207,74,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#6FCF4A' }} />
                    <span className="font-mono text-sm"><span style={{ color: '#6FCF4A', fontWeight: 600 }}>{campaign.participantCount ?? 0}</span> participants</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-sm text-muted-foreground">Tenue le <span className="text-foreground">{formatDate(campaign.actualDate ?? campaign.scheduledDate)}</span></span>
                  </div>
                  {campaign.observations && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                      <span className="font-mono text-sm text-muted-foreground">{campaign.observations}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.25)' }}>
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#E8A020' }} />
                  <div>
                    <p className="font-mono text-sm" style={{ color: '#E8A020' }}>Cette campagne n&apos;a pas encore eu lieu.</p>
                    <p className="font-mono text-sm text-muted-foreground mt-1">Rendez-vous le <span className="text-foreground">{formatDate(campaign.scheduledDate)}</span>.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Photos */}
            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Photos</h2>
              {campaign.photos && campaign.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {campaign.photos.map((url, i) => (
                    <button key={i} type="button" className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer" onClick={() => setLightboxIdx(i)}>
                      <Image
                        src={getImageUrl(url)}
                        alt={`Photo ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(10,26,16,0.45)' }}>
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-border text-center">
                  <Camera className="w-10 h-10" style={{ color: 'rgba(45,125,70,0.2)' }} />
                  <p className="text-sm font-mono text-muted-foreground">Aucune photo disponible.</p>
                </div>
              )}
            </section>
            {/* Documents partagés */}
            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Documents partagés</h2>
              {campaign.documents && campaign.documents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {campaign.documents.map((document, i) => (
                    <a key={i} href={getDocumentUrl(document)} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-mono text-foreground">{documentLabel(document, i)}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-border text-center">
                  <FileText className="w-10 h-10" style={{ color: 'rgba(45,125,70,0.2)' }} />
                  <p className="text-sm font-mono text-muted-foreground">Aucun document disponible.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div style={{ position: 'sticky', top: 88 }}>
              <div className="rounded-2xl p-6 border border-border bg-card flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${tm.bg} ${tm.color}`}>
                    {emoji} {tm.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${sm.bg} ${sm.color}`}>
                    {sm.label}
                  </span>
                </div>
                {campaign.zone && (
                  <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><span className="font-mono text-sm">{campaign.zone.name}</span></div>
                )}
                <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><span className="font-mono text-sm">{formatDate(campaign.scheduledDate)}</span></div>
                {campaign.endDate && (
                  <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><span className="font-mono text-sm">Fin: {formatDate(campaign.endDate)}</span></div>
                )}
                {campaign.sme && (
                  <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-mono text-sm">{campaign.sme.name}</span></div>
                )}
                {campaign.agent && (
                  <div className="flex items-center gap-3"><Users className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-mono text-sm text-muted-foreground">Agent : {campaign.agent.name}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && campaign.photos && (
        <div className="fixed inset-0 z-100 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }} onClick={closeLightbox}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={closeLightbox}>
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-mono px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            {lightboxIdx + 1} / {campaign.photos.length}
          </div>
          {lightboxIdx > 0 && (
            <button className="absolute left-5 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}>
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {lightboxIdx < campaign.photos.length - 1 && (
            <button className="absolute right-5 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}>
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
          <div className="relative w-[min(90vw,1400px)] h-[min(80vh,900px)] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getImageUrl(campaign.photos[lightboxIdx])}
              alt={`Photo ${lightboxIdx + 1}`}
              fill
              className="object-contain rounded-xl"
              sizes="90vw"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
