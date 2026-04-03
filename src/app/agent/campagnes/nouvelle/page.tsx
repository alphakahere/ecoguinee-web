'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { useAuthStore } from '@/stores/auth.store';
import { useCreateCampaign } from '@/hooks/mutations/useCreateCampaign';
import { uploadFiles } from '@/services/uploads';
import { CampaignForm, type CampaignFormValues } from '@/components/admin/campaign-form';

export default function AgentNouvelCampagnePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const createCampaign = useCreateCampaign();

  const handleSubmit = async (values: CampaignFormValues) => {
    if (!values.title || !values.scheduledDate) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    try {
      const [photoUrls, docUrls] = await Promise.all([
        uploadFiles(values.photoFiles),
        uploadFiles(values.docFiles),
      ]);
      const zoneId = values.secteur || values.quartier || values.commune || undefined;
      await createCampaign.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        zoneId,
        address: values.address || undefined,
        organizationId: currentUser?.organizationId || values.organizationId || undefined,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        creatorId: currentUser?.id ?? '',
        agentId: currentUser?.id ?? '',
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        documents: docUrls.length > 0 ? docUrls : undefined,
      });
      toast.success('Campagne créée avec succès !');
      router.push('/agent/campagnes');
    } catch {
      toast.error('Erreur lors de la création.');
    }
  };

  return (
    <div>
      <Link
        href="/agent/campagnes"
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
      </Link>
      <PageHeader title="Nouvelle Campagne" description="Planifier ou enregistrer une campagne de sensibilisation" />
      <CampaignForm
        onSubmit={handleSubmit}
        isPending={createCampaign.isPending}
        submitLabel="Créer la campagne"
        cancelHref="/agent/campagnes"
        organizationId={currentUser?.organizationId || ''}
      />
    </div>
  );
}
