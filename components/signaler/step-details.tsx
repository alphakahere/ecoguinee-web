'use client';

import { CheckCircle } from 'lucide-react';
import type { ReportData, WasteType, Gravite } from './report-wizard';

const WASTE_TYPES: { id: WasteType; emoji: string; label: string; sub: string }[] = [
  { id: 'liquid', emoji: '\uD83D\uDCA7', label: 'Déchets Liquides', sub: 'Déversement, eaux usées, pollution liquide...' },
  { id: 'solid',  emoji: '\uD83D\uDDD1', label: 'Déchets Solides',  sub: 'Dépôt sauvage, ordures ménagères, encombrants...' },
];

const GRAVITES: { id: Gravite; color: string; label: string; sub: string }[] = [
  { id: 'faible',   color: '#2D7D46', label: 'Faible',   sub: 'Peu urgent' },
  { id: 'modere',   color: '#E8A020', label: 'Modéré',   sub: 'À traiter rapidement' },
  { id: 'critique', color: '#D94035', label: 'Critique', sub: 'Intervention immédiate' },
];

interface Props {
  data: ReportData;
  update: (d: Partial<ReportData>) => void;
}

export function StepDetails({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl mb-1">Quel type de problème ?</h1>
        <p className="text-sm font-mono text-muted-foreground">
          Aidez-nous à mieux identifier et traiter le signalement.
        </p>
      </div>

      <div>
        <p className="text-sm font-mono text-muted-foreground mb-3">Type de déchet *</p>
        <div className="grid grid-cols-2 gap-3">
          {WASTE_TYPES.map((wt) => (
            <button
              key={wt.id}
              onClick={() => update({ wasteType: wt.id })}
              className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left min-h-[110px] ${
                data.wasteType === wt.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              {data.wasteType === wt.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-3xl mb-2">{wt.emoji}</span>
              <p className={`font-bold text-sm mb-1 ${data.wasteType === wt.id ? 'text-primary' : ''}`}>{wt.label}</p>
              <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{wt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-mono text-muted-foreground mb-3">Niveau de gravité *</p>
        <div className="flex gap-2">
          {GRAVITES.map((g) => (
            <button
              key={g.id}
              onClick={() => update({ gravite: g.id })}
              className={`flex-1 flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all min-h-[90px] ${
                data.gravite === g.id ? '' : 'border-border hover:border-current/30'
              }`}
              style={data.gravite === g.id ? { borderColor: g.color, background: `${g.color}12` } : {}}
            >
              <div className="w-3 h-3 rounded-full mb-2" style={{ background: g.color }} />
              <p className="font-bold text-xs mb-1" style={data.gravite === g.id ? { color: g.color } : {}}>
                {g.label}
              </p>
              <p className="text-[9px] font-mono text-muted-foreground text-center leading-relaxed">{g.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
