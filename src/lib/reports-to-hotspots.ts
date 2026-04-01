import type { Hotspot, SeverityLevel, WasteType, InterventionStatus } from '@/lib/types';
import type { ApiReport } from '@/types/api';

const SEV_MAP: Record<string, SeverityLevel> = { LOW: 'low', MODERATE: 'medium', CRITICAL: 'critical' };
const TYPE_MAP: Record<string, WasteType> = { SOLID: 'solid', LIQUID: 'liquid' };
const STATUS_MAP: Record<string, InterventionStatus> = {
  PENDING_VALIDATION: 'reported',
  REPORTED: 'reported',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
};

/** Maps API reports to map hotspots (skips rows without valid coordinates). */
export function apiReportsToHotspots(reports: ApiReport[]): Hotspot[] {
  return reports
    .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
    .map((r) => ({
      id: r.id,
      reference: r.reference,
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
    }));
}
