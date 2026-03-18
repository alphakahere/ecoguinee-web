'use client';

import { useState, useMemo } from 'react';
import { RotateCcw, Megaphone, ChevronDown } from 'lucide-react';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CampaignCard } from '@/components/shared/campaign-card';
import type { CampaignType, CampaignStatus } from '@/lib/types';

const TYPE_CHIPS: { id: 'all' | CampaignType; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'sensibilisation', label: 'Sensibilisation' },
  { id: 'promotion', label: 'Promotion' },
  { id: 'formation', label: 'Formation' },
];

const STATUT_OPTS: { id: 'all' | CampaignStatus; label: string }[] = [
  { id: 'all', label: 'Tous les statuts' },
  { id: 'planifiee', label: 'Planifiées' },
  { id: 'en-cours', label: 'En cours' },
  { id: 'terminee', label: 'Terminées' },
  { id: 'annulee', label: 'Annulées' },
];

const PAGE_SIZE = 6;

export function CampaignList() {
  const [typeFilter, setTypeFilter] = useState<'all' | CampaignType>('all');
  const [statutFilter, setStatutFilter] = useState<'all' | CampaignStatus>('all');
  const [communeFilter, setCommuneFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const communes = useMemo(() => Array.from(new Set(CAMPAIGNS.map((c) => c.commune))).sort(), []);

  const filtered = useMemo(() => {
    return CAMPAIGNS.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (statutFilter !== 'all' && c.statut !== statutFilter) return false;
      if (communeFilter !== 'all' && c.commune !== communeFilter) return false;
      return true;
    });
  }, [typeFilter, statutFilter, communeFilter]);

  const hasFilters = typeFilter !== 'all' || statutFilter !== 'all' || communeFilter !== 'all';

  const reset = () => {
    setTypeFilter('all');
    setStatutFilter('all');
    setCommuneFilter('all');
    setVisible(PAGE_SIZE);
  };

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <>
      {/* Filter bar */}
      <div className="sticky z-40 border-b border-border bg-background/95 backdrop-blur-md" style={{ top: 61 }}>
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TYPE_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => { setTypeFilter(chip.id); setVisible(PAGE_SIZE); }}
                className="flex-shrink-0 px-4 py-2 rounded-full font-mono text-sm transition-all"
                style={{
                  background: typeFilter === chip.id ? '#2D7D46' : 'var(--muted)',
                  color: typeFilter === chip.id ? '#fff' : 'var(--muted-foreground)',
                  border: typeFilter === chip.id ? '1px solid #2D7D46' : '1px solid var(--border)',
                }}
              >
                {chip.label}
              </button>
            ))}

            <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
              <div className="relative">
                <select
                  value={communeFilter}
                  onChange={(e) => { setCommuneFilter(e.target.value); setVisible(PAGE_SIZE); }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl font-mono text-sm border border-border bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="all">Toutes les communes</option>
                  {communes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statutFilter}
                  onChange={(e) => { setStatutFilter(e.target.value as 'all' | CampaignStatus); setVisible(PAGE_SIZE); }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl font-mono text-sm border border-border bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  {STATUT_OPTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {hasFilters && (
                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs text-muted-foreground border border-border hover:bg-muted/50 transition-colors">
                  <RotateCcw className="w-3 h-3" />Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Megaphone className="w-12 h-12" style={{ color: 'rgba(45,125,70,0.25)' }} />
            <p className="font-mono text-muted-foreground">Aucune campagne pour ces critères.</p>
            <button onClick={reset} className="flex items-center gap-2 text-sm font-mono" style={{ color: '#2D7D46' }}>
              <RotateCcw className="w-3.5 h-3.5" />Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-mono text-muted-foreground mb-6">
              {filtered.length} campagne{filtered.length > 1 ? 's' : ''}{hasFilters && ' pour ces critères'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {shown.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} index={i} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm transition-all hover:scale-105"
                  style={{ border: '1.5px solid #2D7D46', color: '#2D7D46' }}
                >
                  Charger plus ({filtered.length - visible} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
