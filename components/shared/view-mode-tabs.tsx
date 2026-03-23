'use client';

import { Table2, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'table' | 'map';

interface ViewModeTabsProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
}

export function ViewModeTabs({ value, onChange, className }: ViewModeTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="tablist"
      aria-label="Mode d’affichage"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'table'}
        onClick={() => onChange('table')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition-colors',
          value === 'table'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Table2 className="h-3.5 w-3.5" />
        Tableau
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'map'}
        onClick={() => onChange('map')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition-colors',
          value === 'map'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Map className="h-3.5 w-3.5" />
        Carte
      </button>
    </div>
  );
}
