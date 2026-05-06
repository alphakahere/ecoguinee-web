'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Building2,
  ChevronDown,
  Loader2,
  FileText,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';
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
  type ApiInterventionStatus,
} from '@/types/api';
import Image from 'next/image';
import { getErrorMessage } from '@/services/api';

const selectCls =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-10';

const INTERVENTION_STATUS_PRIORITY: Record<ApiInterventionStatus, number> = {
  IN_PROGRESS: 0,
  ASSIGNED: 1,
  RESOLVED: 2,
  FAILED: 3,
  CANCELLED: 4,
};

export function HotspotDetail({ id }: { id: string }) {
  const { data: report, isLoading, isError } = useReport(id);
  const { data: interventionsData } = useInterventions({ reportId: id });
  const { data: organizationsData } = useOrganizations({ page: 1, limit: 200 });
  const organizations = useMemo(() => organizationsData?.data ?? [], [organizationsData]);
  const assignOrg = useAssignReportOrganization();
  const [organizationId, setOrganizationId] = useState('');

  const sortedInterventions = useMemo<ApiIntervention[]>(() => {
    const list = (
      interventionsData?.data ?? (Array.isArray(interventionsData) ? interventionsData : [])
    ) as ApiIntervention[];
    return [...list].sort((a, b) => {
      const diff =
        INTERVENTION_STATUS_PRIORITY[a.status] - INTERVENTION_STATUS_PRIORITY[b.status];
      if (diff !== 0) return diff;
      const aDate = a.assignedDate ?? a.createdAt;
      const bDate = b.assignedDate ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [interventionsData]);

  const topInterventionId = sortedInterventions[0]?.id;
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);

  const isInterventionExpanded = (interventionId: string) =>
    expandedOverrides[interventionId] ?? interventionId === topInterventionId;
  const toggleIntervention = (interventionId: string) =>
    setExpandedOverrides((prev) => ({
      ...prev,
      [interventionId]: !isInterventionExpanded(interventionId),
    }));

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
    <>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/signalements"
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
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
                <h3 className="text-sm font-semibold mb-3">
                  Photos ({report.photos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.photos.map((url, i) => (
                    <Image
                      key={i}
                      src={getImageUrl(url)}
                      alt={`Photo ${i + 1}`}
                      width={100}
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {report.description}
                </p>
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
                  {sortedInterventions.length > 0 && (
                    <span className="ml-2 text-xs font-mono text-muted-foreground">
                      ({sortedInterventions.length})
                    </span>
                  )}
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
                    Cet signalement n'a pas encore été attribué à une organisation.
                    <br />
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
                    {assignOrg.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    )}
                    {assignOrg.isPending ? 'Attribution…' : 'Attribuer'}
                  </Button>
                </div>
              )}

              {sortedInterventions.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">
                  Aucune intervention liée
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedInterventions.map((iv) => {
                    const sMeta = INTERVENTION_STATUS_META[iv.status];
                    const expanded = isInterventionExpanded(iv.id);
                    const photos = iv.photos ?? [];
                    const isResolved = iv.status === 'RESOLVED';
                    const hasDetails =
                      Boolean(iv.assignedDate) ||
                      Boolean(iv.resolutionDate) ||
                      Boolean(iv.notes) ||
                      photos.length > 0 ||
                      Boolean(iv.pvDocument) ||
                      Boolean(iv.resolutionNote);
                    return (
                      <div
                        key={iv.id}
                        className={`rounded-xl border bg-background overflow-hidden ${
                          isResolved && expanded ? 'border-green-500/30' : 'border-border'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleIntervention(iv.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge
                              className={`${sMeta.bg} ${sMeta.color} border-0 shrink-0`}
                            >
                              {sMeta.label}
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-xs font-mono truncate">
                                {iv.reference ?? `#INT-${iv.id.slice(0, 6)}`}
                              </p>
                              <p className="text-[10px] font-mono text-muted-foreground truncate">
                                {iv.organization?.name ??
                                  iv.organizationId.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                              {iv.assignedDate
                                ? formatDate(iv.assignedDate)
                                : formatDate(iv.createdAt)}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {expanded && (
                          <div
                            className={`px-4 pb-4 pt-3 space-y-4 border-t ${
                              isResolved
                                ? 'border-green-500/20 bg-green-500/5'
                                : 'border-border'
                            }`}
                          >
                            {(iv.assignedDate || iv.resolutionDate) && (
                              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-mono">
                                {iv.assignedDate && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground uppercase">
                                      Assignée
                                    </span>
                                    <span>{formatDate(iv.assignedDate)}</span>
                                  </div>
                                )}
                                {iv.resolutionDate && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground uppercase">
                                      Résolue
                                    </span>
                                    <span>{formatDate(iv.resolutionDate)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {iv.notes && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-mono text-muted-foreground uppercase">
                                  Notes
                                </span>
                                <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                  {iv.notes}
                                </p>
                              </div>
                            )}

                            {photos.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-mono text-muted-foreground uppercase">
                                  Photos ({photos.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {photos.map((url, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() =>
                                        setLightbox({
                                          images: photos.map(getImageUrl),
                                          idx: i,
                                        })
                                      }
                                      className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors w-40 h-28"
                                    >
                                      <Image
                                        src={getImageUrl(url)}
                                        alt={`Photo ${i + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {iv.pvDocument && (
                              <a
                                href={getImageUrl(iv.pvDocument)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                              >
                                <FileText className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-mono truncate flex-1">
                                  Procès-verbal de clôture
                                </span>
                                <Download className="w-4 h-4 shrink-0" />
                              </a>
                            )}

                            {iv.resolutionNote && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-mono text-muted-foreground uppercase">
                                  Note de clôture
                                </span>
                                <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                  {iv.resolutionNote}
                                </p>
                              </div>
                            )}

                            {!hasDetails && (
                              <p className="text-xs font-mono text-muted-foreground">
                                Aucun détail supplémentaire pour le moment.
                              </p>
                            )}

                            <div className="pt-1">
                              <Link
                                href={`/admin/interventions/${iv.id}`}
                                className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
                              >
                                Voir page complète
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — info sidebar */}
          <div className="space-y-4 lg:sticky">
            {/* Status card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    Statut
                  </span>
                  <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>
                    {statusMeta.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    Gravité
                  </span>
                  <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>
                    {severityMeta.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    Type
                  </span>
                  <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>
                    {typeMeta.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    Source
                  </span>
                  <span className="text-xs font-mono">
                    {REPORT_SOURCE_META[report.source].label}
                  </span>
                </div>
              </div>

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
                    className="text-sm font-mono text-foreground leading-snug wrap-break-word"
                    title={
                      assignedOrg?.name ??
                      report.organizationId ??
                      undefined
                    }
                  >
                    {assignedOrgLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div
            className="relative max-w-3xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.idx]}
              alt=""
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {lightbox.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            idx:
                              (prev.idx - 1 + prev.images.length) % prev.images.length,
                          }
                        : null,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/60 text-xs font-mono">
                  {lightbox.idx + 1} / {lightbox.images.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? { ...prev, idx: (prev.idx + 1) % prev.images.length }
                        : null,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-mono transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
