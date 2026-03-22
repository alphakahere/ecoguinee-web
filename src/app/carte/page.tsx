'use client';

import { useState, useMemo } from 'react';
import { PublicNavbar } from '@/components/layouts/public-navbar';
import { MapLoader } from '@/components/maps/map-loader';
import { MapFilters } from '@/components/carte/map-filters';
import { useReports } from '@/hooks/queries/useReports';
import type { Hotspot, SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';
import type { ApiSeverity, ApiWasteType, ReportStatus } from '@/types/api';

const SEV_MAP: Record<string, SeverityLevel> = { LOW: 'low', MODERATE: 'medium', CRITICAL: 'critical' };
const TYPE_MAP: Record<string, WasteType> = { SOLID: 'solid', LIQUID: 'liquid' };
const STATUS_MAP: Record<string, InterventionStatus> = {
  PENDING_VALIDATION: 'reported',
  REPORTED: 'reported',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
};

// Reverse maps: frontend filter values → API query params
const SEV_TO_API: Record<SeverityLevel, ApiSeverity> = { low: 'LOW', medium: 'MODERATE', high: 'CRITICAL', critical: 'CRITICAL' };
const TYPE_TO_API: Record<WasteType, ApiWasteType | undefined> = { solid: 'SOLID', liquid: 'LIQUID', mixed: undefined };
const STATUS_TO_API: Record<InterventionStatus, ReportStatus> = { reported: 'REPORTED', 'in-progress': 'IN_PROGRESS', resolved: 'RESOLVED' };

export default function CartePage() {
  const [severity, setSeverity] = useState<SeverityLevel | 'all'>('all');
  const [wasteType, setWasteType] = useState<WasteType | 'all'>('all');
  const [status, setStatus] = useState<InterventionStatus | 'all'>('all');

  const apiFilters = useMemo(() => ({
    page: 1,
    limit: 200,
    ...(severity !== 'all' && { severity: SEV_TO_API[severity] }),
    ...(wasteType !== 'all' && TYPE_TO_API[wasteType] && { type: TYPE_TO_API[wasteType] }),
    ...(status !== 'all' && { status: STATUS_TO_API[status] }),
  }), [severity, wasteType, status]);

  const { data: allData = { data: [], total: 0 } } = useReports({ page: 1, limit: 200 });
  const { data: filteredData = { data: [] } } = useReports(apiFilters);

  const hasFilters = severity !== 'all' || wasteType !== 'all' || status !== 'all';
  const activeData = hasFilters ? filteredData : allData;

  // Map ApiReport[] → Hotspot[] for MapLoader
  const hotspots: Hotspot[] = useMemo(() =>
    activeData?.data?.map((r) => ({
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
    [activeData],
  );

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
          count={hotspots.length}
          total={allData.total ?? allData.data.length}
        />
        <div className="flex-1">
          <MapLoader
            hotspots={hotspots}
            center={[9.5370, -13.6785]}
            zoom={12}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
