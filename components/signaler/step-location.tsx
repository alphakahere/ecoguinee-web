'use client';

import { useState, useMemo } from 'react';
import { MapPin, ChevronDown, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useZoneTree } from '@/hooks/queries/useZones';
import type { ApiZone } from '@/types/api';
import type { ReportData } from './report-wizard';

interface Props {
  data: ReportData;
  update: (d: Partial<ReportData>) => void;
}

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

export function StepLocation({ data, update }: Props) {
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');
  const { data: tree = [] } = useZoneTree();

  const flat = useMemo(() => flattenTree(tree), [tree]);

  // Build commune (MUNICIPALITY/REGION) → secteur (NEIGHBORHOOD/SECTOR) mapping from zone tree
  const communeZones = useMemo(() => flat.filter(z =>
    z.type === 'MUNICIPALITY',
  ), [flat]);

  const secteurZones = useMemo(() => {
    if (!data.commune) return [];
    const communeZone = flat.find(z => z.id === data.commune);
    if (!communeZone) return [];
    // Get all descendants (neighborhoods + sectors)
    const descendants: ApiZone[] = [];
    function walk(n: ApiZone) { descendants.push(n); n.children?.forEach(walk); }
    communeZone.children?.forEach(walk);
    return descendants;
  }, [flat, data.commune]);

  const handleGPS = () => {
    if (!navigator.geolocation) { setGpsState('denied'); return; }
    setGpsState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsState('success');
        update({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => setGpsState('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCommuneChange = (zoneId: string) => {
    update({ commune: zoneId, secteur: '', zoneId: '' });
  };

  const handleSecteurChange = (zoneId: string) => {
    update({ secteur: zoneId, zoneId });
    // Find the zone name for display
    const zone = flat.find(z => z.id === zoneId);
    if (zone) {
      // Also set secteur name for display in confirm step
    }
  };

  const selectedCommune = flat.find(z => z.id === data.commune);
  const selectedSecteur = flat.find(z => z.id === data.secteur);
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
        gpsState === 'success' ? (
          <div
            role="status"
            aria-live="polite"
            className="w-full rounded-2xl border border-[#6FCF4A]/35 bg-linear-to-br from-[#6FCF4A]/12 to-[#6FCF4A]/4 p-4 sm:p-5"
          >
            <div className="flex gap-4 sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6FCF4A]/20 text-[#2D7D46] ring-1 ring-[#6FCF4A]/25">
                <CheckCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <p className="text-base font-semibold tracking-tight text-foreground">
                  Position détectée
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-muted-foreground leading-snug tabular-nums">
                  <span className="text-muted-foreground/80">Coordonnées GPS</span>
                  <span className="mx-1.5 text-border">·</span>
                  <span className="text-foreground/90">
                    {data.latitude.toFixed(4)}
                    <span className="text-muted-foreground/60">, </span>
                    {data.longitude.toFixed(4)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
            <button
              type="button"
              onClick={handleGPS}
              disabled={gpsState === 'loading'}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all font-mono text-base ${
                gpsState === 'loading'
                ? 'border-primary/40 bg-primary/5 text-primary cursor-wait'
                : 'border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground'
                }`}
            >
              {gpsState === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-primary">Localisation en cours...</span></>
              ) : (
                <><MapPin className="w-5 h-5 text-primary" /><span>Utiliser ma position actuelle</span></>
              )}
            </button>
          )
      )}

      {hasLocation && (
        <div className="rounded-2xl overflow-hidden border border-border relative" style={{ height: 140 }}>
          <div className="absolute inset-0" style={{
            background: '#e8f0e9',
            backgroundImage: 'linear-gradient(rgba(45,125,70,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,125,70,.07) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/90 rounded-lg px-2.5 py-1.5 border border-border">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-mono font-semibold text-foreground">
              {selectedCommune?.name ?? data.commune} — {selectedSecteur?.name ?? data.secteur}
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
                onChange={(e) => handleCommuneChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10"
              >
                <option value="">Choisir une commune...</option>
                {communeZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
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
                  onChange={(e) => handleSecteurChange(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10"
                >
                  <option value="">Choisir un secteur...</option>
                  {secteurZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
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
