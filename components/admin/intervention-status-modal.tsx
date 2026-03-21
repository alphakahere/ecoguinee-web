'use client';

import { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';
import { INTERVENTION_STATUS_META } from '@/types/api';

interface Props {
  intervention: ApiIntervention | null;
  onClose: () => void;
  onSave: (id: string, status: ApiInterventionStatus) => void | Promise<void>;
  isSubmitting?: boolean;
}

const STATUSES = Object.entries(INTERVENTION_STATUS_META) as [ApiInterventionStatus, { label: string }][];

export function InterventionStatusModal({ intervention, onClose, onSave, isSubmitting = false }: Props) {
  const [status, setStatus] = useState<ApiInterventionStatus>('ASSIGNED');

  useEffect(() => {
    if (intervention) setStatus(intervention.status);
  }, [intervention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intervention) return;
    await onSave(intervention.id, status);
  };

  const open = !!intervention;

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none';

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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Modifier le statut</h2>
                    <p className="text-xs text-muted-foreground font-mono">ID: {intervention?.id.slice(0, 8)}…</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Statut</label>
                  <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ApiInterventionStatus)}>
                    {STATUSES.map(([v, m]) => (
                      <option key={v} value={v}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {isSubmitting ? 'En cours…' : 'Enregistrer'}
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
