'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { useZoneTree } from '@/hooks/queries/useZones';
import { uploadFiles } from '@/services/uploads';
import { CampaignForm, type CampaignFormValues } from '@/components/admin/campaign-form';
import type { ApiZone } from '@/types/api';
import { getErrorMessage } from '@/services/api';

interface Props {
  params: Promise<{ id: string }>;
}

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCampagneModifierPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const updateCampaign = useUpdateCampaign();
  const { data: tree = [] } = useZoneTree();

  const flat = useMemo(() => flattenTree(tree), [tree]);

  const zoneId = campaign?.zoneId;

  // Resolve commune/quartier/secteur from the campaign's zoneId
  const locationInit = useMemo(() => {
    if (!zoneId || flat.length === 0) return {};
    const zone = flat.find((z) => z.id === zoneId);
    if (!zone) return {};

    if (zone.type === 'MUNICIPALITY') {
      return { commune: zone.id };
    }
    if (zone.type === 'NEIGHBORHOOD') {
      return { commune: zone.parentId ?? '', quartier: zone.id };
    }
    if (zone.type === 'SECTOR') {
      const quartier = flat.find((z) => z.id === zone.parentId);
      return { commune: quartier?.parentId ?? '', quartier: zone.parentId ?? '', secteur: zone.id };
    }
    return {};
  }, [zoneId, flat]);

  const initialValues = campaign
    ? {
        title: campaign.title,
        description: campaign.description ?? '',
        type: campaign.type,
        address: campaign.address ?? '',
        organizationId: campaign.organizationId ?? '',
        scheduledDate: toDatetimeLocal(campaign.scheduledDate),
        endDate: toDatetimeLocal(campaign.endDate),
        ...locationInit,
      }
    : undefined;

  const handleSubmit = async (values: CampaignFormValues) => {
    if (!values.title || !values.scheduledDate) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    try {
      const [newPhotoUrls, newDocUrls] = await Promise.all([
        uploadFiles(values.photoFiles),
        uploadFiles(values.docFiles),
      ]);
      const zoneId = values.secteur || values.quartier || values.commune || undefined;
      await updateCampaign.mutateAsync({
        id,
        payload: {
          title: values.title,
          description: values.description || undefined,
          type: values.type,
          zoneId,
          address: values.address || undefined,
          organizationId: values.organizationId || undefined,
          scheduledDate: new Date(values.scheduledDate).toISOString(),
          endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
          photos: [...values.existingPhotoUrls, ...newPhotoUrls],
          documents: [...values.existingDocUrls, ...newDocUrls],
        },
      });
      toast.success('Campagne mise à jour !');
      router.push(`/admin/campagnes/${id}`);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors de la mise à jour.');
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <p className="text-sm font-mono text-muted-foreground py-8">
        Impossible de charger la campagne.
      </p>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/campagnes/${id}`}
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la campagne
      </Link>
      <PageHeader title="Modifier la campagne" description={campaign.title} />
      <CampaignForm
        initialValues={initialValues}
        existingPhotoUrls={campaign.photos}
        existingDocUrls={campaign.documents}
        onSubmit={handleSubmit}
        isPending={updateCampaign.isPending}
        submitLabel="Enregistrer les modifications"
        cancelHref={`/admin/campagnes/${id}`}
      />
    </div>
  );
}
