'use client';

import { ChevronLeft, Mail, Phone, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { useZoneTree } from '@/hooks/queries/useZones';
import type { ApiOrganization, ApiZone } from '@/types/api';

interface OrganisationDetailProps {
  organisation: ApiOrganization;
}

export function OrganisationDetail({ organisation }: OrganisationDetailProps) {
  const { data: tree = [] } = useZoneTree();

  // Build a flat id→name map from the zone tree
  const zoneNameMap = (() => {
    const map: Record<string, string> = {};
    const walk = (zones: ApiZone[]) => {
      zones.forEach((z) => {
        map[z.id] = z.name;
        if (z.children) walk(z.children);
      });
    };
    walk(tree);
    return map;
  })();

  const groupZonesByMunicipality = () => {
    const grouped: Record<string, ApiZone[]> = {};
    (organisation.zones ?? []).forEach((zone) => {
      const municipalityId = zone.parentId || 'root';
      if (!grouped[municipalityId]) {
        grouped[municipalityId] = [];
      }
      grouped[municipalityId].push(zone);
    });
    return grouped;
  };

  const getMunicipalityName = (municipalityId: string) => {
    if (municipalityId === 'root') return 'Sans commune';
    return zoneNameMap[municipalityId] ?? municipalityId;
  };

  const groupedZones = groupZonesByMunicipality();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/organisations"
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour aux organisations
      </Link>

      <PageHeader
        title={organisation.name}
        description={organisation.activityType ?? 'Organisation'}
      />

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge className={`border-0 ${organisation.active ? 'bg-[#6FCF4A]/10 text-[#6FCF4A]' : 'bg-muted text-muted-foreground'}`}>
          {organisation.active ? 'Active' : 'Inactive'}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground">ID: {organisation.id.slice(0, 8)}…</span>
      </div>

      {/* Organization Details — single column */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-sm">Informations</h3>

        {organisation.email && (
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <p className="text-xs font-mono text-muted-foreground">Email</p>
              <p className="text-sm font-mono">{organisation.email}</p>
            </div>
          </div>
        )}

        {organisation.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <p className="text-xs font-mono text-muted-foreground">Téléphone</p>
              <p className="text-sm font-mono">{organisation.phone}</p>
            </div>
          </div>
        )}

        {organisation.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <p className="text-xs font-mono text-muted-foreground">Adresse</p>
              <p className="text-sm font-mono">{organisation.address}</p>
            </div>
          </div>
        )}

        {organisation.activityType && (
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <p className="text-xs font-mono text-muted-foreground">Type d'activité</p>
              <p className="text-sm font-mono">{organisation.activityType}</p>
            </div>
          </div>
        )}

        {organisation.description && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-mono text-muted-foreground mb-2">Description</p>
            <p className="text-sm text-muted-foreground">{organisation.description}</p>
          </div>
        )}

        {/* Zones grouped by commune */}
        {(organisation.zones ?? []).length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Zones couvertes</p>
            {Object.entries(groupedZones).map(([municipalityId, zones]) => {
              const municipalityName = getMunicipalityName(municipalityId);
              const neighborhoods = zones.filter((z) => z.type === 'NEIGHBORHOOD');
              return (
                <div key={municipalityId}>
                  {municipalityId !== 'root' && (
                    <p className="text-xs font-semibold text-foreground mb-1.5">{municipalityName}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {neighborhoods.map((n) => (
                      <span
                        key={n.id}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {n.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
