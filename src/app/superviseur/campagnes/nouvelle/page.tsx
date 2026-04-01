'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { useAuthStore } from '@/stores/auth.store';
import { useZones } from '@/hooks/queries/useZones';
import { useCreateCampaign } from '@/hooks/mutations/useCreateCampaign';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import { uploadFiles } from '@/services/uploads';
import {
  createCampaignApiFormSchema,
  type CreateCampaignApiFormInput,
} from '@/lib/validations/campaign.schema';
import { API_CAMPAIGN_TYPE_META } from '@/types/api';

const TYPES = Object.entries(API_CAMPAIGN_TYPE_META);

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SuperviseurCampagneNouvellePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const organizationId = overview?.pme.id;
  const pmeName = overview?.pme.name ?? '';
  const pmeZoneIds = useMemo(() => new Set((overview?.pme.zones ?? []).map((z) => z.id)), [overview?.pme.zones]);

  const { data: zonesData } = useZones({ page: 1, limit: 500 });
  const allZones = zonesData?.data ?? [];
  const zones = pmeZoneIds.size > 0 ? allZones.filter((z) => pmeZoneIds.has(z.id)) : allZones;

  const createCampaign = useCreateCampaign();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignApiFormInput>({
    resolver: zodResolver(createCampaignApiFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'AWARENESS',
      zoneId: '',
      scheduledDate: '',
      endDate: '',
    },
  });

  const scheduledDate = useWatch({ control, name: 'scheduledDate' }) ?? '';

  useEffect(() => {
    if (zones.length !== 1) return;
    setValue('zoneId', zones[0].id);
  }, [zones, setValue]);

  const minScheduled = toDatetimeLocalValue(new Date());
  const minEndDate =
    scheduledDate && scheduledDate >= minScheduled ? scheduledDate : minScheduled;

  const onValid = async (data: CreateCampaignApiFormInput) => {
    if (!organizationId) {
      toast.error('Périmètre de l\'organisation indisponible.');
      return;
    }
    try {
      const [photoUrls, docUrls] = await Promise.all([
        uploadFiles(photoFiles),
        uploadFiles(docFiles),
      ]);
      await createCampaign.mutateAsync({
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        type: data.type,
        zoneId: data.zoneId?.trim() || undefined,
        organizationId,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        endDate: data.endDate?.trim() ? new Date(data.endDate).toISOString() : undefined,
        creatorId: currentUser?.id ?? '',
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        documents: docUrls.length > 0 ? docUrls : undefined,
      });
      toast.success('Campagne créée avec succès !');
      router.push('/superviseur/campagnes');
    } catch {
      toast.error('Erreur lors de la création.');
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30';
  const inputErr = (name: keyof CreateCampaignApiFormInput) =>
    errors[name] ? 'border-destructive focus:ring-destructive/30' : '';

  if (overviewLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div>
        <Link
          href="/superviseur/campagnes"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
        </Link>
        <p className="text-sm font-mono text-muted-foreground py-8">Périmètre de l'organisation indisponible.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/superviseur/campagnes"
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
      </Link>

      <PageHeader
        title="Nouvelle campagne"
        description={`Création pour ${pmeName}`}
      />

      <form
        onSubmit={handleSubmit(onValid)}
        className="bg-card rounded-2xl border border-border p-6 space-y-5"
        noValidate
      >
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Organisation organisatrice
          </label>
          <div className={`${inputCls} bg-muted/40 text-muted-foreground`}>{pmeName}</div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Titre *
          </label>
          <input
            {...register('title')}
            placeholder="Nom de la campagne"
            className={`${inputCls} ${inputErr('title')}`}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-destructive font-mono mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Description détaillée..."
            className={`${inputCls} resize-none ${inputErr('description')}`}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-xs text-destructive font-mono mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Type *
            </label>
            <div className="relative">
              <select
                {...register('type')}
                className={`${inputCls} appearance-none pr-10 ${inputErr('type')}`}
                aria-invalid={!!errors.type}
              >
                {TYPES.map(([v, m]) => (
                  <option key={v} value={v}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.type && (
              <p className="text-xs text-destructive font-mono mt-1">{errors.type.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Zone
            </label>
            <div className="relative">
              <select
                {...register('zoneId')}
                className={`${inputCls} appearance-none pr-10 ${inputErr('zoneId')}`}
              >
                <option value="">— Aucune —</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.zoneId && (
              <p className="text-xs text-destructive font-mono mt-1">{errors.zoneId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Date prévue *
            </label>
            <input
              type="datetime-local"
              {...register('scheduledDate')}
              min={minScheduled}
              className={`${inputCls} ${inputErr('scheduledDate')}`}
              aria-invalid={!!errors.scheduledDate}
            />
            {errors.scheduledDate && (
              <p className="text-xs text-destructive font-mono mt-1">{errors.scheduledDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Date de fin
            </label>
            <input
              type="datetime-local"
              {...register('endDate')}
              min={minEndDate}
              className={`${inputCls} ${inputErr('endDate')}`}
              aria-invalid={!!errors.endDate}
            />
            {errors.endDate && (
              <p className="text-xs text-destructive font-mono mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <FileUploadZone
          files={photoFiles}
          onAddFiles={(f) => setPhotoFiles((prev) => [...prev, ...f])}
          onRemoveFile={(i) => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
          accept="image/*"
          max={5}
          label="Photos"
        />

        <FileUploadZone
          files={docFiles}
          onAddFiles={(f) => setDocFiles((prev) => [...prev, ...f])}
          onRemoveFile={(i) => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
          accept=".pdf,.doc,.docx"
          max={5}
          label="Documents"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/superviseur/campagnes">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={createCampaign.isPending || isSubmitting}>
            {createCampaign.isPending || isSubmitting ? 'Création…' : 'Créer la campagne'}
          </Button>
        </div>
      </form>
    </div>
  );
}
