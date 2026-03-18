'use client';

import { useState, useMemo } from 'react';
import { PublicNavbar } from '@/components/layouts/public-navbar';
import { hotspots } from '@/lib/data/mock-data';
import { MapLoader } from '@/components/maps/map-loader';
import { MapFilters } from '@/components/carte/map-filters';
import type { SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';

export default function CartePage() {
  const [severity, setSeverity] = useState<SeverityLevel | 'all'>('all');
  const [wasteType, setWasteType] = useState<WasteType | 'all'>('all');
  const [status, setStatus] = useState<InterventionStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return hotspots.filter((h) => {
      if (severity !== 'all' && h.severity !== severity) return false;
      if (wasteType !== 'all' && h.wasteType !== wasteType) return false;
      if (status !== 'all' && h.status !== status) return false;
      return true;
    });
  }, [severity, wasteType, status]);

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
