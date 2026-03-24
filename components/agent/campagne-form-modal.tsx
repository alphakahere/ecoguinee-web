'use client';

import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateCampaign } from '@/hooks/mutations/useCreateCampaign';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { useZones } from '@/hooks/queries/useZones';
import type { ApiCampaign, ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_TYPE_META } from '@/types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  /** When provided: edit mode. When absent: create mode. */
  campaign?: ApiCampaign;
  agentId: string;
  smeId: string;
}

const TYPES = Object.entries(API_CAMPAIGN_TYPE_META) as [ApiCampaignType, { label: string }][];

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';

export function CampagneFormModal({ open, onClose, campaign, agentId, smeId }: Props) {
  const isEdit = !!campaign;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ApiCampaignType>('AWARENESS');
  const [zoneId, setZoneId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const isPending = createCampaign.isPending || updateCampaign.isPending;

  const { data: zonesData } = useZones({ page: 1, limit: 200 });
  const zones = zonesData?.data ?? [];

  useEffect(() => {
    if (open) {
      setTitle(campaign?.title ?? '');
      setDescription(campaign?.description ?? '');
      setType(campaign?.type ?? 'AWARENESS');
      setZoneId(campaign?.zoneId ?? '');
      setScheduledDate(campaign?.scheduledDate ? campaign.scheduledDate.slice(0, 16) : '');
      setEndDate(campaign?.endDate ? campaign.endDate.slice(0, 16) : '');
    }
  }, [open, campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Le titre est requis'); return; }
    if (!scheduledDate) { toast.error('La date prévue est requise'); return; }

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      zoneId: zoneId || undefined,
      smeId: smeId || undefined,
      scheduledDate: new Date(scheduledDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    try {
      if (isEdit) {
        await updateCampaign.mutateAsync({ id: campaign!.id, payload: base });
        toast.success('Campagne mise à jour');
      } else {
        await createCampaign.mutateAsync({ ...base, creatorId: agentId, agentId });
        toast.success('Campagne créée');
      }
      onClose();
    } catch {
      toast.error(isEdit ? 'Impossible de modifier la campagne' : 'Impossible de créer la campagne');
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
                    <Megaphone className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-semibold text-sm">{isEdit ? 'Modifier la campagne' : 'Nouvelle campagne'}</h2>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Titre *</label>
                  <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Sensibilisation quartier Madina" />
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Date prévue *</label>
                    <input type="datetime-local" className={inputCls} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Date fin</label>
                    <input type="datetime-local" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <button type="submit" disabled={isPending} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {isPending ? 'En cours…' : isEdit ? 'Enregistrer' : 'Créer'}
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
