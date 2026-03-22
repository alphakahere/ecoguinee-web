'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import { useCreateReport } from '@/hooks/mutations/useCreateReport';
import { useAgentOverview } from '@/hooks/queries/useAgentDashboard';
import { useAuthStore } from '@/stores/auth.store';
import { uploadFiles } from '@/services/uploads';

interface Props {
  open: boolean;
  onClose: () => void;
}

const WASTE_TYPES = [
  { value: 'SOLID', label: 'Solide' },
  { value: 'LIQUID', label: 'Liquide' },
];

const SEVERITIES = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MODERATE', label: 'Modéré' },
  { value: 'CRITICAL', label: 'Critique' },
];

export function NewReportModal({ open, onClose }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { data: overview } = useAgentOverview();
  const zones = overview?.sme.zones ?? [];

  const createReport = useCreateReport();

  const [zoneId, setZoneId] = useState('');
  const [wasteType, setWasteType] = useState('SOLID');
  const [severity, setSeverity] = useState('MODERATE');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [geoLoading, setGeoLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      setZoneId(zones[0]?.id ?? '');
      setWasteType('SOLID');
      setSeverity('MODERATE');
      setDescription('');
      setAddress('');
      setLatitude(0);
      setLongitude(0);
      setPhotoFiles([]);
    }
  }, [open, zones]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGeoLoading(false);
        toast.success('Position obtenue');
      },
      () => {
        setGeoLoading(false);
        toast.error('Impossible d\'obtenir la position');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) { toast.error('Sélectionnez une zone'); return; }
    if (!latitude || !longitude) { toast.error('Position GPS requise'); return; }
    try {
      const photoUrls = await uploadFiles(photoFiles);
      await createReport.mutateAsync({
        type: wasteType,
        severity,
        source: 'AGENT',
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        latitude,
        longitude,
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

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';

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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Zone *</label>
                  <select className={`${inputCls} appearance-none`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Type de déchet *</label>
                    <select className={`${inputCls} appearance-none`} value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
                      {WASTE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Gravité *</label>
                    <select className={`${inputCls} appearance-none`} value={severity} onChange={(e) => setSeverity(e.target.value)}>
                      {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Adresse</label>
                  <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rue, quartier…" />
                </div>

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
                </div>

                <FileUploadZone
                  files={photoFiles}
                  onAddFiles={(f) => setPhotoFiles((prev) => [...prev, ...f])}
                  onRemoveFile={(i) => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  accept="image/*"
                  max={5}
                  label="Photos"
                />

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le problème…" />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <Button type="submit" disabled={createReport.isPending} className="font-mono text-xs">
                    {createReport.isPending ? 'En cours…' : 'Créer le signalement'}
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
