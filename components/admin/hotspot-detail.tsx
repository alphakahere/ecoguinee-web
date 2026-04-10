'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, MapPin, Calendar, User, Phone, Building2, ChevronDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getImageUrl } from '@/lib/utils';
import { useReport } from '@/hooks/queries/useReports';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import { useAssignReportOrganization } from '@/hooks/mutations/useAssignReportOrganization';
import {
  REPORT_STATUS_META,
  SEVERITY_META_API,
  WASTE_TYPE_META,
  REPORT_SOURCE_META,
  INTERVENTION_STATUS_META,
  type ApiIntervention,
} from '@/types/api';
import Image from 'next/image';
import { getErrorMessage } from '@/services/api';

const selectCls =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10';

export function HotspotDetail({ id }: { id: string }) {
  const { data: report, isLoading, isError } = useReport(id);
  const { data: interventionsData } = useInterventions({ reportId: id });
  const { data: organizationsData } = useOrganizations({ page: 1, limit: 200 });
  const organizations = useMemo(() => organizationsData?.data ?? [], [organizationsData]);
  const assignOrg = useAssignReportOrganization();
  const [organizationId, setOrganizationId] = useState('');
  const interventions = (
    interventionsData?.data ??
    (Array.isArray(interventionsData) ? interventionsData : [])
  ) as ApiIntervention[];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="space-y-4">
        <Link href="/admin/signalements" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Signalement introuvable.</p>
      </div>
    );
  }

  const statusMeta = REPORT_STATUS_META[report.status];
  const severityMeta = SEVERITY_META_API[report.severity];
  const typeMeta = WASTE_TYPE_META[report.type];
  const canAssignOrganization = report.status === 'PENDING_VALIDATION';
  const assignedOrg = report.assignedOrganisation ?? report.organization;
  const assignedOrgLabel =
    assignedOrg?.name ??
    (report.organizationId ? `#${report.organizationId.slice(0, 8)}…` : null);

  async function handleAssignOrganization() {
    if (!organizationId || !report?.id) {
      toast.error('Sélectionnez une organisation');
      return;
    }
    try {
      await assignOrg.mutateAsync({ reportId: report.id, organizationId });
      toast.success("Signalement attribué à l'organisation");
      setOrganizationId('');
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Impossible d'attribuer le signalement");
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/admin/signalements" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Signalements
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono">#SIG-{id.slice(0, 6)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {report.photos.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Photos ({report.photos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.photos.map((url, i) => (
                  <Image key={i} src={getImageUrl(url)} alt={`Photo ${i + 1}`} width={100}
                    height={100}
                    quality={100}
                    priority
                    loading="eager"
                    unoptimized
                    className="rounded-xl border border-border object-cover aspect-video w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {report.description && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>
            </div>
          )}

          {/* Contact */}
          {(report.contactName || report.contactPhone) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Contact signaleur</h3>
              <div className="flex flex-col gap-2">
                {report.contactName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{report.contactName}</span>
                  </div>
                )}
                {report.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{report.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interventions */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Interventions
                {interventions.length > 0 && <span className="ml-2 text-xs font-mono text-muted-foreground">({interventions.length})</span>}
              </h3>
            </div>

            {canAssignOrganization && (
              <div className="mb-4 pb-4 border-b border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wide text-muted-foreground">
                    Attribuer à une organisation
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  Cet signalement n'a pas encore été attribué à une organisation.<br />
                  Vous pouvez le faire maintenant pour qu'il soit traité.
                </p>
                <div className="relative max-w-md">
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className={selectCls}
                    disabled={assignOrg.isPending}
                  >
                    <option value="">— Choisir une organisation —</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="button"
                  className="font-mono text-xs"
                  disabled={assignOrg.isPending || !organizationId}
                  onClick={handleAssignOrganization}
                >
                  {assignOrg.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  {assignOrg.isPending ? 'Attribution…' : 'Attribuer'}
                </Button>
              </div>
            )}

            {interventions.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono">Aucune intervention liée</p>
            ) : (
              <div className="space-y-2">
                {interventions.map((iv) => {
                  const sMeta = INTERVENTION_STATUS_META[iv.status];
                  return (
                    <div key={iv.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={`${sMeta.bg} ${sMeta.color} border-0 shrink-0`}>{sMeta.label}</Badge>
                        <div className="min-w-0">
                          <p className="text-xs font-mono truncate">{iv.organization?.name ?? iv.organizationId.slice(0, 8)}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{iv.agent?.name ?? '—'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
                        {iv.assignedDate ? formatDate(iv.assignedDate) : formatDate(iv.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — info sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">
          {/* Status card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Statut</span>
                <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>{statusMeta.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Gravité</span>
                <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>{severityMeta.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Type</span>
                <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>{typeMeta.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Source</span>
                <span className="text-xs font-mono">{REPORT_SOURCE_META[report.source].label}</span>
              </div>
              i            </div>

            <div className="border-t border-border pt-3 space-y-2">
              {report.zone && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{report.zone.name}</span>
                </div>
              )}
              {report.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{report.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">{formatDate(report.createdAt)}</span>
              </div>
              {report.agent && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs">{report.agent.name}</span>
                </div>
              )}
            </div>

            {/* GPS */}
            {report.latitude && report.longitude && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-mono text-muted-foreground">
                  GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </p>
              </div>
            )}
          </div>

          {assignedOrgLabel && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Organisation assignée
              </h3>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p
                  className="text-sm font-mono text-foreground leading-snug break-words"
                  title={assignedOrg?.name ?? report.organizationId ?? undefined}
                >
                  {assignedOrgLabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
