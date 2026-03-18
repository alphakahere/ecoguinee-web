'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Building2, Users, FileText, Camera, Download, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CAMP_TYPE_META, CAMP_STATUS_META } from '@/lib/types';
import { CampaignCard } from '@/components/shared/campaign-card';
import { formatDate } from '@/lib/utils';

const DOC_COLORS: Record<string, string> = { pdf: '#D94035', ppt: '#E8A020', doc: '#3B82F6', xls: '#2D7D46' };
const DOC_LABELS: Record<string, string> = { pdf: 'PDF', ppt: 'PPT', doc: 'DOC', xls: 'XLS' };

interface Props { id: string; basePath?: string; }

export function CampaignDetailView({ id, basePath = '/campagnes' }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const campaign = CAMPAIGNS.find((c) => c.id === id);

  const currentIdx = CAMPAIGNS.findIndex((c) => c.id === id);
  const prevC = currentIdx > 0 ? CAMPAIGNS[currentIdx - 1] : null;
  const nextC = currentIdx < CAMPAIGNS.length - 1 ? CAMPAIGNS[currentIdx + 1] : null;
  const related = CAMPAIGNS.filter((c) => c.commune === campaign?.commune && c.id !== id).slice(0, 3);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <p className="font-mono text-muted-foreground">Campagne introuvable.</p>
        <Link href={basePath} className="text-sm font-mono" style={{ color: '#2D7D46' }}>
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  const tm = CAMP_TYPE_META[campaign.type];
  const sm = CAMP_STATUS_META[campaign.statut];
  const heroPhoto = campaign.photos?.[0]?.url;
  const termineeEvent = campaign.statusHistory.find((e) => e.to === 'terminee');

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
          <img src={heroPhoto} alt={campaign.titre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0F1F15 0%, #2D7D46 60%, #0F1F15 100%)` }}>
            <span style={{ fontSize: '6rem', opacity: 0.35 }}>{tm.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.9) 0%, rgba(10,26,16,0.3) 50%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-5 pb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono" style={{ background: 'rgba(10,26,16,0.85)', color: tm.color, border: `1px solid ${tm.color}40` }}>
              {tm.emoji} {tm.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono" style={{ background: 'rgba(10,26,16,0.85)', color: sm.dot, border: `1px solid ${sm.dot}40` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />{sm.label}
            </span>
          </div>
          <h1 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.4rem,3.5vw,2.25rem)', lineHeight: 1.2 }}>
            {campaign.titre}
          </h1>
          <p className="font-mono text-sm" style={{ color: '#6FCF4A' }}>
            {campaign.secteur}<span className="opacity-50 mx-1.5">·</span>{campaign.commune}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          <div className="flex flex-col gap-10">
            {campaign.description && (
              <section>
                <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>À propos</h2>
                <p className="font-mono text-muted-foreground" style={{ fontSize: '0.95rem', lineHeight: 1.75 }}>{campaign.description}</p>
              </section>
            )}

            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Résultats</h2>
              {campaign.statut === 'terminee' ? (
                <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ borderLeft: '3px solid #6FCF4A', background: 'rgba(111,207,74,0.05)', border: '1px solid rgba(111,207,74,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#6FCF4A' }} />
                    <span className="font-mono text-sm"><span style={{ color: '#6FCF4A', fontWeight: 600 }}>{campaign.participants ?? 0}</span> participants</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span className="font-mono text-sm text-muted-foreground">Tenue le <span className="text-foreground">{formatDate(campaign.datePrevue)}</span></span>
                  </div>
                  {(termineeEvent?.note ?? campaign.notes) && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                      <span className="font-mono text-sm text-muted-foreground">{termineeEvent?.note ?? campaign.notes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.25)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E8A020' }} />
                  <div>
                    <p className="font-mono text-sm" style={{ color: '#E8A020' }}>Cette campagne n&apos;a pas encore eu lieu.</p>
                    <p className="font-mono text-sm text-muted-foreground mt-1">Rendez-vous le <span className="text-foreground">{formatDate(campaign.datePrevue)}</span>.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Documents */}
            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Documents</h2>
              {campaign.documents && campaign.documents.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {campaign.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold" style={{ background: `${DOC_COLORS[doc.type]}18`, color: DOC_COLORS[doc.type], border: `1px solid ${DOC_COLORS[doc.type]}30` }}>
                        {DOC_LABELS[doc.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-semibold truncate">{doc.titre}</p>
                        {doc.description && <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</p>}
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">{doc.taille}</p>
                      </div>
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs" style={{ border: '1px solid #2D7D46', color: '#2D7D46' }}>
                        <Download className="w-3 h-3" />Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-sm text-muted-foreground">Aucun document disponible.</p>
              )}
            </section>

            {/* Photos */}
            <section>
              <h2 className="font-bold mb-4" style={{ fontSize: '1.15rem' }}>Photos</h2>
              {campaign.photos && campaign.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {campaign.photos.map((ph, i) => (
                    <button key={ph.id} className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer" onClick={() => setLightboxIdx(i)}>
                      <img src={ph.url} alt={ph.legende ?? `Photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
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
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div style={{ position: 'sticky', top: 88 }}>
              <div className="rounded-2xl p-6 border border-border bg-card flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono" style={{ background: tm.bg, color: tm.color, border: `1px solid ${tm.color}30` }}>
                    {tm.emoji} {tm.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono" style={{ background: `${sm.dot}14`, color: sm.dot, border: `1px solid ${sm.dot}30` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />{sm.label}
                  </span>
                </div>
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /><span className="font-mono text-sm">{campaign.secteur} — {campaign.commune}</span></div>
                <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /><span className="font-mono text-sm">{formatDate(campaign.datePrevue)}</span></div>
                {campaign.pmeOrganisatrice && <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="font-mono text-sm">{campaign.pmeOrganisatrice}</span></div>}
                <div className="flex items-center gap-3"><Users className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="font-mono text-sm text-muted-foreground">Agent : {campaign.agentNom}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Prev/Next */}
        {(prevC || nextC) && (
          <div className="flex items-stretch justify-between gap-4 mt-16 pt-8 border-t border-border">
            {prevC ? (
              <Link href={`${basePath}/${prevC.id}`} className="group flex items-center gap-3 max-w-xs text-left">
                <ChevronLeft className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Précédent</p>
                  <p className="font-mono text-sm line-clamp-2 group-hover:text-primary transition-colors">{prevC.titre}</p>
                </div>
              </Link>
            ) : <div />}
            {nextC && (
              <Link href={`${basePath}/${nextC.id}`} className="group flex items-center gap-3 max-w-xs text-right ml-auto">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Suivant</p>
                  <p className="font-mono text-sm line-clamp-2 group-hover:text-primary transition-colors">{nextC.titre}</p>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            )}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="font-bold mb-6" style={{ fontSize: '1.15rem' }}>Autres campagnes dans cette commune</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((c, i) => <CampaignCard key={c.id} campaign={c} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && campaign.photos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }} onClick={closeLightbox}>
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
          <img src={campaign.photos[lightboxIdx].url} alt={campaign.photos[lightboxIdx].legende ?? 'Photo'} className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          {campaign.photos[lightboxIdx].legende && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center max-w-md px-4 py-2 rounded-xl text-sm font-mono" style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)' }}>
              {campaign.photos[lightboxIdx].legende}
            </div>
          )}
        </div>
      )}
    </>
  );
}
