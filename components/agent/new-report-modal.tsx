'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import { useCreateReport } from '@/hooks/mutations/useCreateReport';
import { useAuthStore } from '@/stores/auth.store';
import { useZoneTree } from '@/hooks/queries/useZones';
import { uploadFiles } from '@/services/uploads';
import type { ApiZone } from '@/types/api';

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

const schema = z.object({
  commune: z.string().min(1, 'Sélectionnez une commune'),
  quartier: z.string().min(1, 'Sélectionnez un quartier'),
  secteur: z.string().optional(),
  wasteType: z.enum(['SOLID', 'LIQUID']),
  severity: z.enum(['LOW', 'MODERATE', 'CRITICAL']),
  address: z.string().optional(),
  latitude: z.number().refine((v) => v !== 0, { message: 'Position GPS requise' }),
  longitude: z.number().refine((v) => v !== 0, { message: 'Position GPS requise' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const WASTE_TYPES = [
  { value: 'SOLID', label: 'Solide' },
  { value: 'LIQUID', label: 'Liquide' },
] as const;

const SEVERITIES = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MODERATE', label: 'Modéré' },
  { value: 'CRITICAL', label: 'Critique' },
] as const;

const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';
const errorCls = 'mt-1 text-[11px] font-mono text-destructive';

export function NewReportModal({ open, onClose }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { data: tree = [] } = useZoneTree();
  const createReport = useCreateReport();

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const territoire = currentUser?.territoire ?? '';

  // Find the agent's assigned zone and restrict selections accordingly
  const agentZone = useMemo(() => {
    if (!territoire || flat.length === 0) return null;
    return flat.find((z) => z.name === territoire) ?? null;
  }, [flat, territoire]);

  const communeZones = useMemo(() => {
    if (!agentZone) return flat.filter((z) => z.type === 'MUNICIPALITY');
    if (agentZone.type === 'MUNICIPALITY') return [agentZone];
    if (agentZone.type === 'NEIGHBORHOOD') {
      const parent = flat.find((z) => z.id === agentZone.parentId);
      return parent ? [parent] : [];
    }
    if (agentZone.type === 'SECTOR') {
      const quartier = flat.find((z) => z.id === agentZone.parentId);
      const commune = quartier ? flat.find((z) => z.id === quartier.parentId) : null;
      return commune ? [commune] : [];
    }
    return flat.filter((z) => z.type === 'MUNICIPALITY');
  }, [flat, agentZone]);

  const [geoLoading, setGeoLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      commune: '',
      quartier: '',
      secteur: '',
      wasteType: 'SOLID',
      severity: 'MODERATE',
      address: '',
      latitude: 0,
      longitude: 0,
      description: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const commune = watch('commune');
  const quartier = watch('quartier');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const quartierZones = useMemo(() => {
    if (!commune) return [];
    const communeZone = flat.find(z => z.id === commune);
    const quartiers = communeZone?.children?.filter(z => z.type === 'NEIGHBORHOOD') ?? [];
    // If agent zone is a quartier or sector, restrict to that quartier only
    if (agentZone?.type === 'NEIGHBORHOOD') return quartiers.filter((z) => z.id === agentZone.id);
    if (agentZone?.type === 'SECTOR') return quartiers.filter((z) => z.id === agentZone.parentId);
    return quartiers;
  }, [flat, commune, agentZone]);

  const secteurZones = useMemo(() => {
    if (!quartier) return [];
    const quartierZone = flat.find(z => z.id === quartier);
    const secteurs = quartierZone?.children?.filter(z => z.type === 'SECTOR') ?? [];
    // If agent zone is a sector, restrict to that sector only
    if (agentZone?.type === 'SECTOR') return secteurs.filter((z) => z.id === agentZone.id);
    return secteurs;
  }, [flat, quartier, agentZone]);

  // Auto-select when the agent's zone restricts to a single option
  useEffect(() => {
    if (open) {
      reset();
      setPhotoFiles([]);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open || communeZones.length !== 1) return;
    setValue('commune', communeZones[0].id, { shouldValidate: true });
  }, [open, communeZones, setValue]);

  useEffect(() => {
    if (!open || quartierZones.length !== 1) return;
    setValue('quartier', quartierZones[0].id, { shouldValidate: true });
  }, [open, quartierZones, setValue]);

  useEffect(() => {
    if (!open || secteurZones.length !== 1) return;
    setValue('secteur', secteurZones[0].id);
  }, [open, secteurZones, setValue]);

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error('Géolocalisation non disponible'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude, { shouldValidate: true });
        setValue('longitude', pos.coords.longitude, { shouldValidate: true });
        setGeoLoading(false);
        toast.success('Position obtenue');
      },
      () => { setGeoLoading(false); toast.error("Impossible d'obtenir la position"); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmit = async (values: FormValues) => {
    const zoneId = values.secteur || values.quartier;
    let photoUrls: string[] = [];

    if (photoFiles.length > 0) {
      setIsUploading(true);
      try {
        photoUrls = await uploadFiles(photoFiles);
      } catch {
        toast.error("Échec de l'envoi des photos");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      await createReport.mutateAsync({
        type: values.wasteType,
        severity: values.severity,
        source: 'AGENT',
        description: values.description?.trim() || undefined,
        address: values.address?.trim() || undefined,
        latitude: values.latitude,
        longitude: values.longitude,
        zoneId,
        agentId: currentUser?.id,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });
      toast.success('Signalement créé');
      onClose();
    } catch {
      toast.error('Impossible de créer le signalement');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Nouveau Signalement</h2>
                    <p className="text-xs text-muted-foreground font-mono">Signaler un point noir</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Commune */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Commune *</label>
                  <select
                    className={`${inputCls} appearance-none`}
                    disabled={communeZones.length <= 1}
                    {...register('commune')}
                    onChange={(e) => {
                      setValue('commune', e.target.value, { shouldValidate: true });
                      setValue('quartier', '', { shouldValidate: false });
                      setValue('secteur', '', { shouldValidate: false });
                    }}
                  >
                    <option value="">— Sélectionner —</option>
                    {communeZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                  {errors.commune && <p className={errorCls}>{errors.commune.message}</p>}
                </div>

                {/* Quartier */}
                {commune && (
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Quartier *</label>
                    <select
                      className={`${inputCls} appearance-none`}
                      disabled={quartierZones.length <= 1}
                      {...register('quartier')}
                      onChange={(e) => {
                        setValue('quartier', e.target.value, { shouldValidate: true });
                        setValue('secteur', '', { shouldValidate: false });
                      }}
                    >
                      <option value="">— Sélectionner —</option>
                      {quartierZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    {errors.quartier && <p className={errorCls}>{errors.quartier.message}</p>}
                  </div>
                )}

                {/* Secteur */}
                {quartier && secteurZones.length > 0 && (
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Secteur</label>
                    <select className={`${inputCls} appearance-none`} disabled={secteurZones.length <= 1} {...register('secteur')}>
                      <option value="">— Sélectionner —</option>
                      {secteurZones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Type + Gravité */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Type de déchet *</label>
                    <select className={`${inputCls} appearance-none`} {...register('wasteType')}>
                      {WASTE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Gravité *</label>
                    <select className={`${inputCls} appearance-none`} {...register('severity')}>
                      {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Adresse</label>
                  <input className={inputCls} placeholder="Rue, quartier…" {...register('address')} />
                </div>

                {/* GPS */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Position GPS *</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={geoLoading}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {geoLoading ? 'Localisation…' : 'Ma position'}
                    </button>
                    {latitude !== 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </span>
                    )}
                  </div>
                  {errors.latitude && <p className={errorCls}>{errors.latitude.message}</p>}
                </div>

                {/* Photos */}
                <FileUploadZone
                  files={photoFiles}
                  onAddFiles={(f) => setPhotoFiles((prev) => [...prev, ...f])}
                  onRemoveFile={(i) => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  accept="image/*"
                  max={5}
                  label="Photos"
                />

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} placeholder="Décrivez le problème…" {...register('description')} />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <Button type="submit" disabled={isUploading || createReport.isPending} className="font-mono text-xs">
                    {isUploading ? 'Envoi des photos…' : createReport.isPending ? 'En cours…' : 'Créer le signalement'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
