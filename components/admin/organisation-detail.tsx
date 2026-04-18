'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Mail, Phone, MapPin, FileText, User, Shield, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { useZoneTree } from '@/hooks/queries/useZones';
import { useCreateUser } from '@/hooks/mutations/useCreateUser';
import { ManagerModal } from '@/components/admin/manager-modal';
import { queryKeys } from '@/lib/query-keys';
import type { ApiOrganization, ApiZone } from '@/types/api';

interface OrganisationDetailProps {
  organisation: ApiOrganization;
}

export function OrganisationDetail({ organisation }: OrganisationDetailProps) {
  const queryClient = useQueryClient();
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const createUser = useCreateUser();
  const { data: tree = [] } = useZoneTree();

  const handleCreateManager = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'MANAGER',
        organizationId: organisation.id,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(organisation.id) });
      toast.success('Manager créé avec succès');
      setManagerModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      toast.error(message);
    }
  };

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
    const grouped: Record<string, { wholeCommune: boolean; quartiers: ApiZone[] }> = {};
    const bucket = (key: string) => {
      if (!grouped[key]) grouped[key] = { wholeCommune: false, quartiers: [] };
      return grouped[key];
    };
    (organisation.zones ?? []).forEach((zone) => {
      if (zone.type === 'MUNICIPALITY') {
        bucket(zone.id).wholeCommune = true;
      } else {
        bucket(zone.parentId ?? 'root').quartiers.push(zone);
      }
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

  const managerCard = (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Responsable
      </h3>

      {manager ? (
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
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-mono text-muted-foreground">
            Aucun responsable assigné
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setManagerModalOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un responsable
          </Button>
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
                {Object.entries(groupedZones).map(([municipalityId, { wholeCommune, quartiers }]) => {
                  const municipalityName = getMunicipalityName(municipalityId);
                  return (
                    <div key={municipalityId}>
                      {municipalityId !== 'root' && (
                        <p className="text-xs font-semibold text-foreground mb-1.5">{municipalityName}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {wholeCommune && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                            Toute la commune
                          </span>
                        )}
                        {quartiers.map((n) => (
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

      <ManagerModal
        open={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        onSave={handleCreateManager}
        isSubmitting={createUser.isPending}
      />
    </div>
  );
}
