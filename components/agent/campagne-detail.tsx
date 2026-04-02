'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Calendar, User, Building2, Pencil, Trash2, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { documentLabel, formatDate, getDocumentUrl, getImageUrl } from '@/lib/utils';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { CompleteCampaignDialog } from './complete-campaign-dialog';
import type { ApiCampaignStatus } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

const TRANSITIONS: Record<string, { status: ApiCampaignStatus; label: string; color: string }[]> = {
  PLANNED:     [
    { status: 'IN_PROGRESS', label: 'Démarrer',  color: 'bg-[#E8A020] hover:bg-[#E8A020]/90 text-white' },
    { status: 'CANCELLED',   label: 'Annuler',   color: 'bg-[#D94035]/10 text-[#D94035] hover:bg-[#D94035]/20' },
  ],
  IN_PROGRESS: [
    { status: 'COMPLETED',   label: 'Terminer',  color: 'bg-[#6FCF4A] hover:bg-[#6FCF4A]/90 text-white' },
    { status: 'CANCELLED',   label: 'Annuler',   color: 'bg-[#D94035]/10 text-[#D94035] hover:bg-[#D94035]/20' },
  ],
  COMPLETED:   [],
  CANCELLED:   [],
};

interface CampagneDetailProps {
  id: string;
  /** Base path for links, e.g. '/agent/campagnes' or '/superviseur/campagnes' */
  basePath?: string;
}

export function CampagneDetail({ id, basePath = '/agent/campagnes' }: CampagneDetailProps) {
  const router = useRouter();

  const { data: campaign, isLoading, isError } = useCampaign(id);
  const [completeOpen, setCompleteOpen] = useState(false);
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  async function handleTransition(status: ApiCampaignStatus) {
    if (status === 'COMPLETED') { setCompleteOpen(true); return; }
    try {
      await updateCampaign.mutateAsync({ id, payload: { status } });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    }
  }

  async function handleDelete() {
    if (!campaign) return;
    if (!confirm(`Supprimer la campagne "${campaign.title}" ?`)) return;
    try {
      await deleteCampaign.mutateAsync(id);
      toast.success('Campagne supprimée');
      router.push(basePath);
    } catch {
      toast.error('Impossible de supprimer la campagne');
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="space-y-4">
        <Link href={basePath} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Campagne introuvable.</p>
      </div>
    );
  }

  const statusMeta = API_CAMPAIGN_STATUS_META[campaign.status];
  const typeMeta = API_CAMPAIGN_TYPE_META[campaign.type];
  const transitions = TRANSITIONS[campaign.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={basePath} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> Campagnes
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-mono truncate max-w-[200px]">{campaign.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{campaign.title}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>{typeMeta.label}</Badge>
                  <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>{statusMeta.label}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`${basePath}/${id}/modifier`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Modifier
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteCampaign.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </div>

            {/* Status transitions */}
            {transitions.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs font-mono text-muted-foreground mr-2">Actions :</span>
                {transitions.map((t) => (
                  <button
                    key={t.status}
                    type="button"
                    onClick={() => handleTransition(t.status)}
                    disabled={updateCampaign.isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-50 ${t.color}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {campaign.description && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
            </div>
          )}

          {/* Photos */}
          {(campaign.photos ?? []).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Photos ({(campaign.photos ?? []).length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(campaign.photos ?? []).map((url, i) => (
                  <Image key={i} src={getImageUrl(url)} alt={`Photo ${i + 1}`} className="rounded-xl border border-border object-cover aspect-video w-full" width={100} height={100} />
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {(campaign.documents ?? []).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Documents ({(campaign.documents ?? []).length})</h3>
              <ul className="space-y-2">
                {(campaign.documents ?? []).map((url, i) => (
                  <li key={`${url}-${i}`}>
                    <a
                      href={getDocumentUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-mono text-foreground">{documentLabel(url, i)}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-70 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observations */}
          {campaign.observations && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-2">Observations</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.observations}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Date prévue</p>
                <p className="font-mono text-xs">{formatDate(campaign.scheduledDate)}</p>
              </div>
            </div>
            {campaign.endDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Date fin</p>
                  <p className="font-mono text-xs">{formatDate(campaign.endDate)}</p>
                </div>
              </div>
            )}
            {campaign.actualDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Date réalisée</p>
                  <p className="font-mono text-xs">{formatDate(campaign.actualDate)}</p>
                </div>
              </div>
            )}
            {campaign.zone && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">{campaign.zone.name}</span>
              </div>
            )}
            {campaign.organization && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">{campaign.organization.name}</span>
              </div>
            )}
            {campaign.agent && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs">{campaign.agent.name}</span>
              </div>
            )}
            {campaign.creator && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs text-muted-foreground">Créé par {campaign.creator.name}</span>
              </div>
            )}
            {campaign.participantCount != null && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Participants</p>
                <p className="text-lg font-bold">{campaign.participantCount}</p>
              </div>
            )}

            {/* Proof section */}
            {(campaign.proofDocument || campaign.proofNote) && (
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Preuve de clôture</p>
                {campaign.proofDocument && (
                  <a
                    href={getDocumentUrl(campaign.proofDocument)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-mono text-foreground">Document de preuve</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-70 group-hover:opacity-100" />
                  </a>
                )}
                {campaign.proofNote && (
                  <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{campaign.proofNote}</p>
                )}
              </div>
            )}

            <div className="border-t border-border pt-3">
              <p className="text-[10px] font-mono text-muted-foreground">Créé le {formatDate(campaign.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <CompleteCampaignDialog
        open={completeOpen}
        campaignId={id}
        existingPhotos={campaign.photos ?? []}
        onClose={() => setCompleteOpen(false)}
      />
    </div>
  );
}
