'use client';

import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string }[];
  className?: string;
}

export function Tabs({ value, onValueChange, tabs, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 rounded-lg bg-muted p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            value === tab.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
