'use client';

import { LayoutGrid, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InterventionViewMode = 'kanban' | 'table';

interface InterventionViewTabsProps {
  value: InterventionViewMode;
  onChange: (v: InterventionViewMode) => void;
  className?: string;
}

export function InterventionViewTabs({
  value,
  onChange,
  className,
}: InterventionViewTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="tablist"
      aria-label="Mode d'affichage"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'kanban'}
        onClick={() => onChange('kanban')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition-colors',
          value === 'kanban'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Kanban
      </button>
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
    </div>
  );
}
