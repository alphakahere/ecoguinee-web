'use client';

import dynamic from 'next/dynamic';
import type { Hotspot } from '@/lib/types';

const DynamicMap = dynamic(() => import('./dynamic-map').then((mod) => mod.DynamicMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/30 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-foreground font-mono">Chargement de la carte...</p>
    </div>
  ),
});

interface MapLoaderProps {
  hotspots: Hotspot[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function MapLoader(props: MapLoaderProps) {
  return <DynamicMap {...props} />;
}
