'use client';

import { useState, useEffect } from 'react';
import { X, Wrench, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateIntervention } from '@/hooks/mutations/useCreateIntervention';
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import { useUsers } from '@/hooks/queries/useUsers';

interface Props {
  open: boolean;
  reportId: string;
  onClose: () => void;
}

export function CreateInterventionModal({ open, reportId, onClose }: Props) {
  const [organizationId, setOrganizationId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [notes, setNotes] = useState('');

  const createIntervention = useCreateIntervention();
  const { data: organizationsData } = useOrganizations({ page: 1, limit: 100 });
  const { data: agentsData } = useUsers({ roleGroup: 'agent', page: 1, limit: 100 });

  const organizations = organizationsData?.data ?? [];
  const agents = agentsData?.data ?? [];

  useEffect(() => {
    if (open) { setOrganizationId(''); setAgentId(''); setNotes(''); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) { toast.error('Veuillez sélectionner une organisation'); return; }
    if (!agentId) { toast.error('Veuillez sélectionner un agent'); return; }
    try {
      await createIntervention.mutateAsync({
        reportId,
        organizationId,
        agentId,
        notes: notes.trim() || undefined,
      });
      toast.success('Intervention créée');
      onClose();
    } catch {
      toast.error('Impossible de créer l\'intervention');
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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Nouvelle intervention</h2>
                    <p className="text-xs text-muted-foreground font-mono">Signalement {reportId.slice(0, 8)}…</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <fieldset disabled={createIntervention.isPending} className="space-y-4 disabled:opacity-60">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Organisation *</label>
                  <select className={`${inputCls} appearance-none`} value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                    <option value="">— Sélectionner une organisation —</option>
                    {organizations.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Agent *</label>
                  <select className={`${inputCls} appearance-none`} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
                    <option value="">— Sélectionner un agent —</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Notes</label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instructions ou observations…"
                  />
                </div>

                </fieldset>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} disabled={createIntervention.isPending} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50">Annuler</button>
                  <button type="submit" disabled={createIntervention.isPending} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5">
                    {createIntervention.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {createIntervention.isPending ? 'En cours…' : 'Créer l\'intervention'}
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
