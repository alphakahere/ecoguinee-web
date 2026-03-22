'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MapLoader } from '@/components/maps/map-loader';
import { useReports } from '@/hooks/queries/useReports';
import type { Hotspot, SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';

const SEV_MAP: Record<string, SeverityLevel> = { LOW: 'low', MODERATE: 'medium', CRITICAL: 'critical' };
const TYPE_MAP: Record<string, WasteType> = { SOLID: 'solid', LIQUID: 'liquid' };
const STATUS_MAP: Record<string, InterventionStatus> = {
  PENDING_VALIDATION: 'reported',
  REPORTED: 'reported',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
};

export function MapPreview() {
  const { data = { data: [] } } = useReports({ page: 1, limit: 50 });

  const hotspots: Hotspot[] = useMemo(() =>
    data.data.map((r) => ({
      id: r.id,
      location: {
        lat: r.latitude,
        lng: r.longitude,
        address: r.address ?? '—',
        territoire: r.zone?.name ?? '—',
        sector: r.zone?.name ?? '—',
      },
      wasteType: TYPE_MAP[r.type] ?? 'solid',
      severity: SEV_MAP[r.severity] ?? 'medium',
      description: r.description ?? '',
      reportedBy: r.contactName ?? 'Citoyen',
      reportedAt: r.createdAt,
      status: STATUS_MAP[r.status] ?? 'reported',
    })),
    [data],
  );

  return (
    <section className="py-20" style={{ background: '#0A1A10' }}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#6FCF4A' }}>
            Carte interactive
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
            Visualisez les points noirs en temps réel
          </h2>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 420 }}>
          <MapLoader
            hotspots={hotspots}
            center={[9.5370, -13.6785]}
            zoom={12}
            className="w-full h-full"
          />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/carte"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm transition-all hover:scale-105"
            style={{ border: '1.5px solid #2D7D46', color: '#6FCF4A' }}
          >
            Voir la carte complète
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
