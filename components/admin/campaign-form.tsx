'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useZoneTree } from '@/hooks/queries/useZones';
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import type { ApiCampaignType, ApiZone } from '@/types/api';
import { API_CAMPAIGN_TYPE_META } from '@/types/api';

const TYPES = Object.entries(API_CAMPAIGN_TYPE_META) as [ApiCampaignType, { label: string }][];

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface CampaignFormValues {
  title: string;
  description: string;
  type: ApiCampaignType;
  commune: string;
  quartier: string;
  secteur: string;
  address: string;
  organizationId: string;
  scheduledDate: string;
  endDate: string;
  photoFiles: File[];
  docFiles: File[];
  existingPhotoUrls: string[];
  existingDocUrls: string[];
}

type CampaignFormState = Omit<CampaignFormValues, 'photoFiles' | 'docFiles' | 'existingPhotoUrls' | 'existingDocUrls'>;

interface CampaignFormProps {
  initialValues?: Partial<Omit<CampaignFormValues, 'photoFiles' | 'docFiles' | 'existingPhotoUrls' | 'existingDocUrls'>>;
  existingPhotoUrls?: string[];
  existingDocUrls?: string[];
  onSubmit: (values: CampaignFormValues) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  cancelHref: string;
}

export function CampaignForm({ initialValues, existingPhotoUrls: initPhotoUrls = [], existingDocUrls: initDocUrls = [], onSubmit, isPending, submitLabel, cancelHref }: CampaignFormProps) {
  const { data: tree = [] } = useZoneTree();
  const { data: organizationsData } = useOrganizations();
  const organizations = organizationsData?.data ?? [];

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const communeZones = useMemo(() => flat.filter((z) => z.type === 'MUNICIPALITY'), [flat]);

  const [form, setForm] = useState<CampaignFormState>({
    title: '',
    description: '',
    type: 'AWARENESS',
    commune: '',
    quartier: '',
    secteur: '',
    address: '',
    organizationId: '',
    scheduledDate: '',
    endDate: '',
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(initPhotoUrls);
  const [existingDocUrls, setExistingDocUrls] = useState<string[]>(initDocUrls);

  // Seed form with initialValues once the zone tree is ready
  useEffect(() => {
    if (!initialValues || flat.length === 0) return;

    const commune = initialValues.commune ?? '';
    const quartier = initialValues.quartier ?? '';
    const secteur = initialValues.secteur ?? '';

    // If cascading fields not provided but we have zoneId-level info in initialValues,
    // treat commune/quartier/secteur as already resolved by the parent page.
    setForm((prev) => ({
      ...prev,
      title: initialValues.title ?? prev.title,
      description: initialValues.description ?? prev.description,
      type: initialValues.type ?? prev.type,
      commune,
      quartier,
      secteur,
      address: initialValues.address ?? prev.address,
      organizationId: initialValues.organizationId ?? prev.organizationId,
      scheduledDate: initialValues.scheduledDate ?? prev.scheduledDate,
      endDate: initialValues.endDate ?? prev.endDate,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.length]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const handleCommuneChange = (id: string) => setForm((f) => ({ ...f, commune: id, quartier: '', secteur: '' }));
  const handleQuartierChange = (id: string) => setForm((f) => ({ ...f, quartier: id, secteur: '' }));

  const quartierZones = useMemo(() => {
    if (!form.commune) return [];
    const commune = flat.find((z) => z.id === form.commune);
    return commune?.children?.filter((z) => z.type === 'NEIGHBORHOOD') ?? [];
  }, [flat, form.commune]);

  const secteurZones = useMemo(() => {
    if (!form.quartier) return [];
    const quartier = flat.find((z) => z.id === form.quartier);
    return quartier?.children?.filter((z) => z.type === 'SECTOR') ?? [];
  }, [flat, form.quartier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, photoFiles, docFiles, existingPhotoUrls, existingDocUrls });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30';
  const selectCls = `${inputCls} appearance-none pr-10`;

  const minScheduled = toDatetimeLocalValue(new Date());
  const minEndDate = form.scheduledDate && form.scheduledDate >= minScheduled ? form.scheduledDate : minScheduled;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">

      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Titre *</label>
        <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Nom de la campagne" className={inputCls} required />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Description</label>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Description détaillée..." className={`${inputCls} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Type *</label>
          <div className="relative">
            <select value={form.type} onChange={(e) => update('type', e.target.value)} className={selectCls}>
              {TYPES.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Organisation organisatrice</label>
          <div className="relative">
            <select value={form.organizationId} onChange={(e) => update('organizationId', e.target.value)} className={selectCls}>
              <option value="">— Aucune —</option>
              {organizations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cascading location */}
      <div className="space-y-3">
        <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wide">Localisation</label>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">Commune</label>
          <div className="relative">
            <select value={form.commune} onChange={(e) => handleCommuneChange(e.target.value)} className={selectCls}>
              <option value="">Choisir une commune…</option>
              {communeZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {form.commune && (
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">Quartier</label>
            <div className="relative">
              <select value={form.quartier} onChange={(e) => handleQuartierChange(e.target.value)} className={selectCls}>
                <option value="">Choisir un quartier…</option>
                {quartierZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        {form.quartier && secteurZones.length > 0 && (
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">Secteur</label>
            <div className="relative">
              <select value={form.secteur} onChange={(e) => update('secteur', e.target.value)} className={selectCls}>
                <option value="">Choisir un secteur…</option>
                {secteurZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">Adresse précise</label>
          <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Ex: Rue KA-020, face au marché…" className={inputCls} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Date prévue *</label>
          <input type="datetime-local" value={form.scheduledDate} onChange={(e) => update('scheduledDate', e.target.value)} min={minScheduled} className={inputCls} required />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Date de fin</label>
          <input type="datetime-local" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} min={minEndDate} className={inputCls} />
        </div>
      </div>

      <FileUploadZone
        files={photoFiles}
        existingUrls={existingPhotoUrls}
        onAddFiles={(f) => setPhotoFiles((prev) => [...prev, ...f])}
        onRemoveFile={(i) => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
        onRemoveExisting={(i) => setExistingPhotoUrls((prev) => prev.filter((_, idx) => idx !== i))}
        accept="image/*"
        max={5}
        label="Photos"
      />

      <FileUploadZone
        files={docFiles}
        existingUrls={existingDocUrls}
        onAddFiles={(f) => setDocFiles((prev) => [...prev, ...f])}
        onRemoveFile={(i) => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
        onRemoveExisting={(i) => setExistingDocUrls((prev) => prev.filter((_, idx) => idx !== i))}
        accept=".pdf,.doc,.docx"
        max={5}
        label="Documents"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">Annuler</Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'En cours…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
