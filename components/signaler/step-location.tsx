'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { ReportData } from './report-wizard';

const COMMUNES_SECTEURS: Record<string, string[]> = {
  'Kaloum':     ['Centre Administratif', 'Port de Conakry', 'Tombo', 'Boulbinet'],
  'Dixinn':     ['Hamdallaye', 'Coleah', 'Landréah', 'Cameroun', 'Camayenne'],
  'Matam':      ['Almamya', 'Madina', 'Dabondy', 'Enta', 'Bonfi'],
  'Ratoma':     ['Ratoma Centre', 'Cosa', 'Kipé', 'Bambéto', 'Sonfonia'],
  'Matoto':     ['Kagbelen', 'Yattaya', 'Kobaya', 'Gbessia', 'Tombolia', 'Matoto Centre'],
  'Kindia':     ['Kindia Centre', 'Bangouyah', 'Molota'],
  'Labé':       ['Labé Centre', 'Kouramangui', 'Kaalan'],
  'Kankan':     ['Kankan Centre', 'Koura', 'Sabadou'],
  "N'Zérékoré": ["N'Zérékoré Centre", 'Bossou', 'Lainé'],
  'Faranah':    ['Faranah Centre', 'Baro', 'Tiro'],
  'Mamou':      ['Mamou Centre', 'Timbo', 'Pita'],
  'Boké':       ['Boké Centre', 'Kamsar', 'Sangarédi'],
  'Siguiri':    ['Siguiri Centre', 'Doko', 'Norassoba'],
};

interface Props {
  data: ReportData;
  update: (d: Partial<ReportData>) => void;
}

export function StepLocation({ data, update }: Props) {
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');

  const handleGPS = () => {
    if (!navigator.geolocation) { setGpsState('denied'); return; }
    setGpsState('loading');
    navigator.geolocation.getCurrentPosition(
      () => {
        setTimeout(() => {
          setGpsState('success');
          update({ commune: 'Ratoma', secteur: 'Bambéto' });
        }, 1400);
      },
      () => setGpsState('denied'),
      { timeout: 6000 },
    );
  };

  const communes = Object.keys(COMMUNES_SECTEURS);
  const secteurs = data.commune ? COMMUNES_SECTEURS[data.commune] ?? [] : [];
  const hasLocation = !!(data.commune && data.secteur);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-2xl mb-1">Où se trouve le problème ?</h1>
        <p className="text-sm font-mono text-muted-foreground">
          Localisez le point noir pour que les équipes interviennent rapidement.
        </p>
      </div>

      {gpsState === 'denied' && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#E8A020]/10 border border-[#E8A020]/30">
          <AlertTriangle className="w-4 h-4 text-[#E8A020] shrink-0 mt-0.5" />
          <p className="text-sm font-mono text-[#E8A020]">
            Localisation non disponible. Veuillez sélectionner manuellement.
          </p>
        </div>
      )}

      {gpsState !== 'denied' && (
        <button
          onClick={handleGPS}
          disabled={gpsState === 'loading' || gpsState === 'success'}
          className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all font-mono text-base ${
            gpsState === 'success'
              ? 'border-[#6FCF4A] bg-[#6FCF4A]/10 text-[#6FCF4A] cursor-default'
              : gpsState === 'loading'
                ? 'border-primary/40 bg-primary/5 text-primary cursor-wait'
                : 'border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground'
          }`}
        >
          {gpsState === 'loading' ? (
            <><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-primary">Localisation en cours...</span></>
          ) : gpsState === 'success' ? (
            <><CheckCircle className="w-5 h-5" /><span>Position détectée</span></>
          ) : (
            <><MapPin className="w-5 h-5 text-primary" /><span>Utiliser ma position actuelle</span></>
          )}
        </button>
      )}

      {hasLocation && (
        <div className="rounded-2xl overflow-hidden border border-border relative" style={{ height: 140 }}>
          <div className="absolute inset-0" style={{
            background: '#e8f0e9',
            backgroundImage: 'linear-gradient(rgba(45,125,70,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,125,70,.07) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/90 rounded-lg px-2.5 py-1.5 shadow-sm border border-border">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-mono font-semibold text-foreground">
              {data.commune} — {data.secteur}
            </span>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {gpsState === 'denied' ? 'Sélectionner manuellement' : 'Ou sélectionner manuellement'}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-2">Commune *</label>
            <div className="relative">
              <select
                value={data.commune}
                onChange={(e) => update({ commune: e.target.value, secteur: '' })}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10"
              >
                <option value="">Choisir une commune...</option>
                {communes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {data.commune && (
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">Secteur / Quartier *</label>
              <div className="relative">
                <select
                  value={data.secteur}
                  onChange={(e) => update({ secteur: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10"
                >
                  <option value="">Choisir un secteur...</option>
                  {secteurs.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
