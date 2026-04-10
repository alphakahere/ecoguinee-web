'use client';

import { useState, useEffect } from 'react';
import { X, Megaphone, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { useZones } from '@/hooks/queries/useZones';
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import { FileUploadZone } from '@/components/shared/file-upload-zone';
import { uploadFiles } from '@/services/uploads';
import type { ApiCampaign, ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_TYPE_META } from '@/types/api';
import { getErrorMessage } from '@/services/api';

interface Props {
  open: boolean;
  campaign: ApiCampaign;
  onClose: () => void;
  /** When set, organisation cannot be changed (superviseur) */
  fixedOrganizationId?: string;
  fixedOrganizationName?: string;
}

const TYPES = Object.entries(API_CAMPAIGN_TYPE_META) as [ApiCampaignType, { label: string }][];

export function CampaignEditModal({
  open,
  campaign,
  onClose,
  fixedOrganizationId,
  fixedOrganizationName,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ApiCampaignType>('AWARENESS');
  const [zoneId, setZoneId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingDocs, setExistingDocs] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newDocFiles, setNewDocFiles] = useState<File[]>([]);

  const updateCampaign = useUpdateCampaign();
  const { data: zonesData } = useZones({ page: 1, limit: 200 });
  const { data: organizationsData } = useOrganizations({ page: 1, limit: 100 });
  const zones = zonesData?.data ?? [];
  const organizations = organizationsData?.data ?? [];

  useEffect(() => {
    if (open && campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description ?? '');
      setType(campaign.type);
      setZoneId(campaign.zoneId ?? '');
      setOrganizationId(fixedOrganizationId ?? campaign.organizationId ?? '');
      setScheduledDate(campaign.scheduledDate ? campaign.scheduledDate.slice(0, 16) : '');
      setEndDate(campaign.endDate ? campaign.endDate.slice(0, 16) : '');
      setExistingPhotos(campaign.photos ?? []);
      setExistingDocs(campaign.documents ?? []);
      setNewPhotoFiles([]);
      setNewDocFiles([]);
    }
  }, [open, campaign, fixedOrganizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Le titre est requis'); return; }
    try {
      const [uploadedPhotos, uploadedDocs] = await Promise.all([
        uploadFiles(newPhotoFiles),
        uploadFiles(newDocFiles),
      ]);
      const effectiveOrganizationId = fixedOrganizationId ?? organizationId;
      await updateCampaign.mutateAsync({
        id: campaign.id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          zoneId: zoneId || undefined,
          organizationId: effectiveOrganizationId || undefined,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          photos: [...existingPhotos, ...uploadedPhotos],
          documents: [...existingDocs, ...uploadedDocs],
        },
      });
      toast.success('Campagne mise à jour');
      onClose();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Impossible de mettre à jour la campagne');
      toast.error(message);
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';

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
                    <Megaphone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Modifier la campagne</h2>
                    <p className="text-xs text-muted-foreground font-mono">{campaign.id.slice(0, 8)}…</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <fieldset disabled={updateCampaign.isPending} className="space-y-4 disabled:opacity-60">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Titre *</label>
                  <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Type</label>
                  <select className={`${inputCls} appearance-none`} value={type} onChange={(e) => setType(e.target.value as ApiCampaignType)}>
                    {TYPES.map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Zone</label>
                  <select className={`${inputCls} appearance-none`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                    <option value="">— Aucune —</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Organisation organisatrice</label>
                  {fixedOrganizationId ? (
                    <p className={`${inputCls} bg-muted/40 text-muted-foreground`}>
                      {fixedOrganizationName ?? fixedOrganizationId}
                    </p>
                  ) : (
                    <select className={`${inputCls} appearance-none`} value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                      <option value="">— Aucune —</option>
                      {organizations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Date prévue</label>
                    <input type="datetime-local" className={inputCls} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Date fin</label>
                    <input type="datetime-local" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <FileUploadZone
                  files={newPhotoFiles}
                  existingUrls={existingPhotos}
                  onAddFiles={(f) => setNewPhotoFiles((prev) => [...prev, ...f])}
                  onRemoveFile={(i) => setNewPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  onRemoveExisting={(i) => setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  accept="image/*"
                  max={5}
                  label="Photos"
                />

                <FileUploadZone
                  files={newDocFiles}
                  existingUrls={existingDocs}
                  onAddFiles={(f) => setNewDocFiles((prev) => [...prev, ...f])}
                  onRemoveFile={(i) => setNewDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  onRemoveExisting={(i) => setExistingDocs((prev) => prev.filter((_, idx) => idx !== i))}
                  accept=".pdf,.doc,.docx"
                  max={5}
                  label="Documents"
                />

                </fieldset>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} disabled={updateCampaign.isPending} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50">Annuler</button>
                  <button type="submit" disabled={updateCampaign.isPending} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5">
                    {updateCampaign.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {updateCampaign.isPending ? 'En cours…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
