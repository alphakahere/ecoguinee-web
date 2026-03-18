'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Hotspot } from '@/lib/types';
import { SEVERITY_META, STATUS_META } from '@/lib/types';

const CONAKRY_CENTER: [number, number] = [9.5370, -13.6785];

const severityColors: Record<string, string> = {
  low: '#3B82F6',
  medium: '#E8A020',
  high: '#E8A020',
  critical: '#D94035',
};

function createIcon(severity: string, status: string) {
  const color = status === 'resolved' ? '#6FCF4A' : severityColors[severity] ?? '#2D7D46';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin ${status === 'resolved' ? 'resolved' : severity}" style="background:${color}"><div class="marker-pin-inner"></div></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
}

interface DynamicMapProps {
  hotspots: Hotspot[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function DynamicMap({ hotspots, center = CONAKRY_CENTER, zoom = 13, className }: DynamicMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} className={className} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((h) => (
        <Marker key={h.id} position={[h.location.lat, h.location.lng]} icon={createIcon(h.severity, h.status)}>
          <Popup>
            <div className="p-3 min-w-[200px]">
              <h4 className="font-semibold text-sm mb-1">{h.location.address}</h4>
              <p className="text-xs text-muted-foreground mb-2">{h.description}</p>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${SEVERITY_META[h.severity].bg} ${SEVERITY_META[h.severity].color}`}>
                  {SEVERITY_META[h.severity].label}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${STATUS_META[h.status].bg} ${STATUS_META[h.status].color}`}>
                  {STATUS_META[h.status].label}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
