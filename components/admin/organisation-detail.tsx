'use client';

import { ChevronLeft, Mail, Phone, MapPin, FileText, User, Shield } from 'lucide-react';
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

  const manager = (organisation.supervisors ?? []).find((s) => s.role === 'MANAGER');
  const otherSupervisors = (organisation.supervisors ?? []).filter((s) => s.role !== 'MANAGER');

  const managerCard = (manager || otherSupervisors.length > 0) && (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Responsable
      </h3>

      {manager && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{manager.name}</p>
              <Badge className="border-0 bg-[#E8A020]/10 text-[#E8A020] text-[10px] mt-0.5">
                Manager
              </Badge>
            </div>
          </div>

          {manager.email && (
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{manager.email}</span>
            </div>
          )}

          {manager.phone && (
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{manager.phone}</span>
            </div>
          )}
        </div>
      )}

      {otherSupervisors.length > 0 && (
        <div className={manager ? 'border-t border-border pt-4 space-y-3' : 'space-y-3'}>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
            Superviseurs
          </p>
          {otherSupervisors.map((sup) => (
            <div key={sup.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{sup.name}</p>
                {sup.email && (
                  <p className="text-xs font-mono text-muted-foreground truncate">{sup.email}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members count */}
      {(organisation.members ?? []).length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs font-mono text-muted-foreground">
            {organisation.members!.length} membre{organisation.members!.length > 1 ? 's' : ''} au total
          </p>
        </div>
      )}
    </div>
  );

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

      {/* Mobile: Manager card shown above */}
      <div className="lg:hidden">{managerCard}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Organization info (2/3 on lg) */}
        <div className="lg:col-span-2">
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
                  <p className="text-xs font-mono text-muted-foreground">Type d&apos;activité</p>
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

        {/* Right column — Manager card (1/3 on lg, hidden on mobile since shown above) */}
        <div className="hidden lg:block">{managerCard}</div>
      </div>
    </div>
  );
}
