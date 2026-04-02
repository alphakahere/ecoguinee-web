'use client';

import { useState, useMemo } from 'react';
import { PublicNavbar } from '@/components/layouts/public-navbar';
import { MapLoader } from '@/components/maps/map-loader';
import { MapFilters } from '@/components/carte/map-filters';
import { useReports } from '@/hooks/queries/useReports';
import { apiReportsToHotspots } from '@/lib/reports-to-hotspots';
import type { SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';
import type { ApiSeverity, ApiWasteType, ReportStatus } from '@/types/api';

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

  const hotspots = useMemo(
    () => apiReportsToHotspots(activeData?.data ?? []),
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
