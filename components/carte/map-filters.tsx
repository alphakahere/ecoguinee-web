'use client';

import { Filter, RotateCcw } from 'lucide-react';
import type { SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';

interface Props {
  severity: SeverityLevel | 'all';
  onSeverityChange: (v: SeverityLevel | 'all') => void;
  wasteType: WasteType | 'all';
  onWasteTypeChange: (v: WasteType | 'all') => void;
  status: InterventionStatus | 'all';
  onStatusChange: (v: InterventionStatus | 'all') => void;
  count: number;
  total: number;
}

const SEVERITY_OPTS: { value: SeverityLevel | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'critical', label: 'Critique', color: '#D94035' },
  { value: 'high', label: 'Élevé', color: '#E8A020' },
  { value: 'medium', label: 'Moyen', color: '#2D7D46' },
  { value: 'low', label: 'Faible', color: '#6B7280' },
];

const WASTE_OPTS: { value: WasteType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'solid', label: 'Solide' },
  { value: 'liquid', label: 'Liquide' },
  { value: 'mixed', label: 'Mixte' },
];

const STATUS_OPTS: { value: InterventionStatus | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'reported', label: 'Signalé', color: '#D94035' },
  { value: 'in-progress', label: 'En cours', color: '#E8A020' },
  { value: 'resolved', label: 'Résolu', color: '#6FCF4A' },
];

export function MapFilters({
  severity, onSeverityChange,
  wasteType, onWasteTypeChange,
  status, onStatusChange,
  count, total,
}: Props) {
  const hasFilters = severity !== 'all' || wasteType !== 'all' || status !== 'all';

  const reset = () => {
    onSeverityChange('all');
    onWasteTypeChange('all');
    onStatusChange('all');
  };

  return (
    <aside className="w-72 bg-card border-r border-border p-5 overflow-y-auto hidden md:block">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-sm">Filtres</h2>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {count}/{total}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Gravité</p>
          <div className="space-y-1">
            {SEVERITY_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSeverityChange(opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all text-left ${
                  severity === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                {opt.color && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Type de déchet</p>
          <div className="space-y-1">
            {WASTE_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onWasteTypeChange(opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all text-left ${
                  wasteType === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Statut</p>
          <div className="space-y-1">
            {STATUS_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all text-left ${
                  status === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                {opt.color && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-mono text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>
    </aside>
  );
}
