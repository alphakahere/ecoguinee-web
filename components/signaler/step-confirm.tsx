'use client';

import { useMemo } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { useZoneTree } from '@/hooks/queries/useZones';
import type { ApiZone } from '@/types/api';
import type { ReportData, Step } from './report-wizard';

const GRAVITE_LABEL: Record<string, string> = { faible: 'Faible', modere: 'Modéré', critique: 'Critique' };
const GRAVITE_COLOR: Record<string, string> = { faible: '#2D7D46', modere: '#E8A020', critique: '#D94035' };

interface Props {
  data: ReportData;
  goTo: (step: Step) => void;
}

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

export function StepConfirm({ data, goTo }: Props) {
  const { data: tree = [] } = useZoneTree();
  const flat = useMemo(() => flattenTree(tree), [tree]);

  const communeName = flat.find(z => z.id === data.commune)?.name ?? data.commune;
  const quartierName = flat.find(z => z.id === data.quartier)?.name;
  const secteurName = flat.find(z => z.id === data.secteur)?.name;

  const locationLabel = [communeName, quartierName, secteurName].filter(Boolean).join(' — ');

  const summary = [
    { label: locationLabel, step: 1 as Step },
    { label: data.wasteType === 'liquid' ? 'Déchets Liquides' : 'Déchets Solides', step: 2 as Step },
    { label: `Gravité ${GRAVITE_LABEL[data.gravite ?? 'faible']}`, step: 2 as Step },
    { label: data.photos.length > 0 ? `${data.photos.length} photo(s)` : 'Aucune photo', step: 3 as Step },
    ...(data.description ? [{ label: `"${data.description.slice(0, 55)}${data.description.length > 55 ? '...' : ''}"`, step: 3 as Step }] : []),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-2xl mb-1">Vérifiez votre signalement</h1>
        <p className="text-sm font-mono text-muted-foreground">
          Tout est correct ? Envoyez votre signalement.
        </p>
      </div>

      <div className="bg-muted/20 rounded-2xl border border-border overflow-hidden">
        {summary.map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3.5 ${i < summary.length - 1 ? 'border-b border-border' : ''}`}>
            <p className="text-sm font-mono">{item.label}</p>
            <button
              onClick={() => goTo(item.step)}
              className="text-[11px] font-mono text-primary hover:underline flex items-center gap-0.5 ml-3 shrink-0"
            >
              Modifier <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {data.latitude > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border">
          <span className="text-[10px] font-mono text-muted-foreground">
            GPS : {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
          </span>
        </div>
      )}

      {!data.telephone && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[12px] font-mono text-muted-foreground">
            Vous ne recevrez pas de mise à jour sur ce signalement.{' '}
            <button onClick={() => goTo(3)} className="text-primary underline underline-offset-2">
              Ajoutez vos coordonnées
            </button>{' '}
            pour être informé(e).
          </p>
        </div>
      )}

      {data.gravite && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: GRAVITE_COLOR[data.gravite] }} />
          <span className="text-xs font-mono text-muted-foreground">
            Priorité : <span className="font-semibold text-foreground">{GRAVITE_LABEL[data.gravite]}</span>
          </span>
        </div>
      )}
    </div>
  );
}
