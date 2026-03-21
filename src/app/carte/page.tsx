'use client';

import { useState, useMemo } from 'react';
import { PublicNavbar } from '@/components/layouts/public-navbar';
import { MapLoader } from '@/components/maps/map-loader';
import { MapFilters } from '@/components/carte/map-filters';
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

export default function CartePage() {
  const [severity, setSeverity] = useState<SeverityLevel | 'all'>('all');
  const [wasteType, setWasteType] = useState<WasteType | 'all'>('all');
  const [status, setStatus] = useState<InterventionStatus | 'all'>('all');

  const { data } = useReports({ page: 1, limit: 200 });
  const reports = data?.data ?? [];

  // Map ApiReport[] → Hotspot[] for MapLoader
  const hotspots: Hotspot[] = useMemo(() =>
    reports.map((r) => ({
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
      photoUrl: r.photos?.[0],
      reportedBy: r.agent?.name ?? r.contactName ?? 'Citoyen',
      reportedAt: r.createdAt,
      status: STATUS_MAP[r.status] ?? 'reported',
      assignedTo: undefined,
    })),
    [reports],
  );

  const filtered = useMemo(() => {
    return hotspots.filter((h) => {
      if (severity !== 'all' && h.severity !== severity) return false;
      if (wasteType !== 'all' && h.wasteType !== wasteType) return false;
      if (status !== 'all' && h.status !== status) return false;
      return true;
    });
  }, [hotspots, severity, wasteType, status]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <PublicNavbar />
      <div className="flex-1 flex overflow-hidden">
        <MapFilters
          severity={severity}
          onSeverityChange={setSeverity}
          wasteType={wasteType}
          onWasteTypeChange={setWasteType}
          status={status}
          onStatusChange={setStatus}
          count={filtered.length}
          total={hotspots.length}
        />
        <div className="flex-1">
          <MapLoader
            hotspots={filtered}
            center={[9.5370, -13.6785]}
            zoom={12}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
