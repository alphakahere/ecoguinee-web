'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { useAuthStore } from '@/stores/auth.store';
import { useZones } from '@/hooks/queries/useZones';
import { useSMEs } from '@/hooks/queries/useSMEs';
import { useCreateCampaign } from '@/hooks/mutations/useCreateCampaign';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import { uploadFiles } from '@/services/uploads';
import type { ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_TYPE_META } from '@/types/api';

const TYPES = Object.entries(API_CAMPAIGN_TYPE_META) as [ApiCampaignType, { label: string }][];

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCampagneNouvellePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { data: zonesData } = useZones();
  const { data: smesData } = useSMEs();
  const createCampaign = useCreateCampaign();

  const zones = zonesData?.data ?? [];
  const smes = smesData?.data ?? [];

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'AWARENESS' as ApiCampaignType,
    zoneId: '',
    smeId: '',
    scheduledDate: '',
    endDate: '',
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.scheduledDate) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    try {
      const [photoUrls, docUrls] = await Promise.all([
        uploadFiles(photoFiles),
        uploadFiles(docFiles),
      ]);
      await createCampaign.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        zoneId: form.zoneId || undefined,
        smeId: form.smeId || undefined,
        scheduledDate: new Date(form.scheduledDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        creatorId: currentUser?.id ?? '',
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        documents: docUrls.length > 0 ? docUrls : undefined,
      });
      toast.success('Campagne créée avec succès !');
      router.push('/admin/campagnes');
    } catch {
      toast.error('Erreur lors de la création.');
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30';

  const minScheduled = toDatetimeLocalValue(new Date());
  const minEndDate =
    form.scheduledDate && form.scheduledDate >= minScheduled ? form.scheduledDate : minScheduled;

  return (
    <div>
      <Link
        href="/admin/campagnes"
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
      </Link>

      <PageHeader
        title="Nouvelle Campagne"
        description="Créer une campagne de sensibilisation"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border p-6 space-y-5"
      >
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Titre *
          </label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Nom de la campagne"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Description détaillée..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Type *
            </label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className={`${inputCls} appearance-none pr-10`}
              >
                {TYPES.map(([v, m]) => (
                  <option key={v} value={v}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Zone
            </label>
            <div className="relative">
              <select
                value={form.zoneId}
                onChange={(e) => update('zoneId', e.target.value)}
                className={`${inputCls} appearance-none pr-10`}
              >
                <option value="">— Aucune —</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Date prévue *
            </label>
            <input
              type="datetime-local"
              value={form.scheduledDate}
              onChange={(e) => update('scheduledDate', e.target.value)}
              min={minScheduled}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
              Date de fin
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              min={minEndDate}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">
            Organisation organisatrice
          </label>
          <div className="relative">
            <select
              value={form.smeId}
              onChange={(e) => update('smeId', e.target.value)}
              className={`${inputCls} appearance-none pr-10`}
            >
              <option value="">— Aucune —</option>
              {smes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
          <Link href="/admin/campagnes">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={createCampaign.isPending}>
            {createCampaign.isPending ? 'Création…' : 'Créer la campagne'}
          </Button>
        </div>
      </form>
    </div>
  );
}
