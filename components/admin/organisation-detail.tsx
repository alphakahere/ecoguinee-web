'use client';

import { ChevronLeft, Mail, Phone, MapPin, FileText, Toggle2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import type { ApiSME } from '@/types/api';

interface OrganisationDetailProps {
  organisation: ApiSME;
}

export function OrganisationDetail({ organisation }: OrganisationDetailProps) {
  const groupZonesByType = () => {
    const grouped: Record<string, typeof organisation.zones> = {};
    (organisation.zones ?? []).forEach((zone) => {
      if (!grouped[zone.type]) {
        grouped[zone.type] = [];
      }
      grouped[zone.type].push(zone);
    });
    return grouped;
  };

  const groupedZones = groupZonesByType();
  const typeLabels: Record<string, string> = {
    MUNICIPALITY: 'Communes',
    NEIGHBORHOOD: 'Quartiers',
    REGION: 'Régions',
    PREFECTURE: 'Préfectures',
    SUB_PREFECTURE: 'Sous-préfectures',
    DISTRICT: 'Districts',
    SECTOR: 'Secteurs',
  };

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

      {/* Organization Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
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
        </div>

        {/* Right Column - Zones */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-semibold text-sm">Zones couvertes</h3>

          {(organisation.zones ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune zone assignée</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedZones).map(([type, zones]) => (
                <div key={type}>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">
                    {typeLabels[type] || type}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {zones.map((zone) => (
                      <span
                        key={zone.id}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {zone.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
