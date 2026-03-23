'use client';

import { useMemo } from 'react';
import { MapLoader } from '@/components/maps/map-loader';
import { apiReportsToHotspots } from '@/lib/reports-to-hotspots';
import { cn } from '@/lib/utils';
import type { ApiReport } from '@/types/api';

const CONAKRY_CENTER: [number, number] = [9.537, -13.6785];

interface ReportsMapViewProps {
  reports: ApiReport[];
  isLoading?: boolean;
  className?: string;
}

export function ReportsMapView({ reports, isLoading, className }: ReportsMapViewProps) {
  const hotspots = useMemo(() => apiReportsToHotspots(reports), [reports]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[min(60vh,560px)] items-center justify-center rounded-xl border border-border bg-muted/30',
          className,
        )}
      >
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[min(60vh,560px)] items-center justify-center rounded-xl border border-border bg-muted/20',
          className,
        )}
      >
        <p className="text-sm font-mono text-muted-foreground">Aucun signalement géolocalisé</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border',
        'min-h-[min(60vh,560px)] h-[min(60vh,560px)]',
        className,
      )}
    >
      <MapLoader
        hotspots={hotspots}
        center={CONAKRY_CENTER}
        zoom={12}
        className="h-full min-h-[min(60vh,560px)] w-full"
      />
    </div>
  );
}
