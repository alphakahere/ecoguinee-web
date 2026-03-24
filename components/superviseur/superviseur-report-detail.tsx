'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, User, Phone, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getImageUrl } from '@/lib/utils';
import { useReport } from '@/hooks/queries/useReports';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import {
  REPORT_STATUS_META,
  SEVERITY_META_API,
  WASTE_TYPE_META,
  REPORT_SOURCE_META,
  INTERVENTION_STATUS_META,
  type ApiIntervention,
} from '@/types/api';
import { SuperviseurCreateInterventionModal } from './superviseur-create-intervention-modal';
import Image from 'next/image';

export function SuperviseurReportDetail({ id }: { id: string }) {
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const smeId = overview?.pme.id;
  const pmeName = overview?.pme.name;

  const { data: report, isLoading, isError } = useReport(id);
  const { data: interventionsData } = useInterventions({ reportId: id });
  const interventions = (
    interventionsData?.data ??
    (Array.isArray(interventionsData) ? interventionsData : [])
  ) as ApiIntervention[];
  const [modalOpen, setModalOpen] = useState(false);

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
        <Link
          href="/superviseur/signalements"
          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Signalements
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Signalement introuvable.</p>
      </div>
    );
  }

  const statusMeta = REPORT_STATUS_META[report.status];
  const severityMeta = SEVERITY_META_API[report.severity];
  const typeMeta = WASTE_TYPE_META[report.type];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/superviseur/signalements"
          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Signalements
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono">#SIG-{id.slice(0, 6)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {report.photos.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Photos ({report.photos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.photos.map((url, i) => (
                  <Image
                    key={i}
                    src={getImageUrl(url)}
                    alt={`Photo ${i + 1}`}
                    width={100}
                    height={100}
                    quality={100}
                    priority={i === 0}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    unoptimized
                    className="rounded-xl border border-border object-cover aspect-video w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {report.description && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>
            </div>
          )}

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

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="text-sm font-semibold">
                Interventions
                {interventions.length > 0 && (
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    ({interventions.length})
                  </span>
                )}
              </h3>
              <Button
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={overviewLoading || !smeId}
                className="font-mono text-xs h-8"
                title={!smeId && !overviewLoading ? 'Périmètre indisponible' : undefined}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {overviewLoading ? 'Chargement…' : 'Assigner un agent'}
              </Button>
            </div>
            {interventions.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono">Aucune intervention liée</p>
            ) : (
              <div className="space-y-2">
                {interventions.map((iv) => {
                  const sMeta = INTERVENTION_STATUS_META[iv.status];
                  return (
                    <div
                      key={iv.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-background"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={`${sMeta.bg} ${sMeta.color} border-0 shrink-0`}>
                          {sMeta.label}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-xs font-mono truncate">
                            {iv.agent?.name ?? 'Agent —'}
                          </p>
                          {iv.notes && (
                            <p className="text-[10px] font-mono text-muted-foreground line-clamp-2">
                              {iv.notes}
                            </p>
                          )}
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

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:sticky lg:top-24">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Statut</span>
                <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>
                  {statusMeta.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Gravité</span>
                <Badge className={`${severityMeta.bg} ${severityMeta.color} border-0`}>
                  {severityMeta.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Type</span>
                <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>{typeMeta.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Source</span>
                <span className="text-xs font-mono">{REPORT_SOURCE_META[report.source].label}</span>
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
                  <span className="font-mono text-xs">Signalement : {report.agent.name}</span>
                </div>
              )}
            </div>

            {report.latitude != null && report.longitude != null && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-mono text-muted-foreground">
                  GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {smeId && (
        <SuperviseurCreateInterventionModal
          open={modalOpen}
          reportId={id}
          smeId={smeId}
          pmeName={pmeName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
