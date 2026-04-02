'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCampaign } from '@/hooks/mutations/useCreateCampaign';
import { useZones } from '@/hooks/queries/useZones';
import { useAuthStore } from '@/stores/auth.store';
import { uploadFiles } from '@/services/uploads';
import { API_CAMPAIGN_TYPE_META, API_CAMPAIGN_STATUS_META } from '@/types/api';
import type { ApiCampaignType, ApiCampaignStatus } from '@/types/api';

const TYPES    = Object.entries(API_CAMPAIGN_TYPE_META)   as [ApiCampaignType,   { label: string }][];
const STATUSES = Object.entries(API_CAMPAIGN_STATUS_META) as [ApiCampaignStatus, { label: string }][];

const schema = z.object({
  title:         z.string().min(1, 'Titre requis'),
  description:   z.string().optional(),
  type:          z.enum(['AWARENESS', 'PROMOTION', 'TRAINING']),
  status:        z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  zoneId:        z.string().optional(),
  scheduledDate: z.string().min(1, 'Date prévue requise'),
  endDate:       z.string().optional(),
  proofNote:     z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30';
const errorCls = 'mt-1 text-[11px] font-mono text-destructive';
const labelCls = 'block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide';

export function CampagneCreateForm() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const agentId = currentUser?.id ?? '';
  const organizationId = currentUser?.organizationId ?? '';

  const [proofFile, setProofFile]   = useState<File | null>(null);
  const [proofError, setProofError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const createCampaign = useCreateCampaign();
  const { data: zonesData } = useZones({ page: 1, limit: 200 });
  const zones = zonesData?.data ?? [];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', type: 'AWARENESS', status: 'PLANNED',
      zoneId: '', scheduledDate: '', endDate: '', proofNote: '',
    },
  });

  const status = watch('status');
  const isCompleted = status === 'COMPLETED';

  const onSubmit = async (values: FormValues) => {
    if (isCompleted && !proofFile) {
      setProofError('Le document de preuve est requis');
      return;
    }
    setProofError('');

    let proofDocument: string | undefined;
    if (proofFile) {
      setIsUploading(true);
      try {
        const urls = await uploadFiles([proofFile]);
        proofDocument = urls[0];
      } catch {
        toast.error("Échec de l'envoi du document de preuve");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      await createCampaign.mutateAsync({
        title:         values.title.trim(),
        description:   values.description?.trim() || undefined,
        type:          values.type,
        status:        values.status,
        zoneId:        values.zoneId || undefined,
        organizationId:         organizationId || undefined,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
        endDate:       values.endDate ? new Date(values.endDate).toISOString() : undefined,
        creatorId:     agentId,
        agentId,
        proofDocument,
        proofNote:     proofDocument ? (values.proofNote?.trim() || undefined) : undefined,
      });
      toast.success('Campagne créée');
      router.push('/agent/campagnes');
    } catch {
      toast.error('Impossible de créer la campagne');
    }
  };

  const isPending = isUploading || createCampaign.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Back */}
      <Link href="/agent/campagnes" className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-3.5 h-3.5" /> Retour aux campagnes
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className={labelCls}>Titre *</label>
          <input className={inputCls} placeholder="Ex: Sensibilisation quartier Madina" {...register('title')} />
          {errors.title && <p className={errorCls}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={`${inputCls} min-h-[100px] resize-y`} placeholder="Objectifs, déroulement…" {...register('description')} />
        </div>

        {/* Type + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type</label>
            <select className={`${inputCls} appearance-none`} {...register('type')}>
              {TYPES.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Statut initial</label>
            <select className={`${inputCls} appearance-none`} {...register('status')}>
              {STATUSES.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
        </div>

        {/* Zone */}
        <div>
          <label className={labelCls}>Zone</label>
          <select className={`${inputCls} appearance-none`} {...register('zoneId')}>
            <option value="">— Aucune —</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date prévue *</label>
            <input type="datetime-local" className={inputCls} {...register('scheduledDate')} />
            {errors.scheduledDate && <p className={errorCls}>{errors.scheduledDate.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Date de fin</label>
            <input type="datetime-local" className={inputCls} {...register('endDate')} />
          </div>
        </div>
      </div>

      {/* Proof section — shown when status = COMPLETED */}
      {isCompleted && (
        <div className="rounded-2xl border border-[#6FCF4A]/30 bg-[#6FCF4A]/5 p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#2D7D46] mb-0.5">Preuve de clôture</p>
            <p className="text-xs font-mono text-muted-foreground">Requise pour créer une campagne déjà terminée.</p>
          </div>

          <div>
            <label className={labelCls}>Document *</label>
            {proofFile ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-mono truncate flex-1">{proofFile.name}</span>
                <button type="button" onClick={() => setProofFile(null)} className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <Upload className="w-6 h-6 text-primary/60" />
                <span className="text-xs font-mono text-muted-foreground">Cliquer pour choisir un fichier</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setProofFile(f); setProofError(''); }
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            {proofError && <p className={errorCls}>{proofError}</p>}
          </div>

          <div>
            <label className={labelCls}>Note de clôture</label>
            <textarea className={`${inputCls} min-h-[80px] resize-y`} placeholder="Résultats, observations…" {...register('proofNote')} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/agent/campagnes" className="px-5 py-2.5 rounded-xl text-sm font-mono border border-border hover:bg-muted/50 transition-colors">
          Annuler
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isUploading ? 'Envoi du document…' : createCampaign.isPending ? 'En cours…' : 'Créer la campagne'}
        </button>
      </div>
    </form>
  );
}
