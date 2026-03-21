'use client';

import { useEffect, useState } from 'react';
import { X, Map, Layers, ToggleLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ApiZone, CreateZonePayload, UpdateZonePayload, ZoneType } from '@/types/api';
import { ZONE_TYPE_META } from '@/types/api';

interface ZoneModalProps {
  open: boolean;
  zone?: ApiZone | null;
  allZones: ApiZone[];
  onClose: () => void;
  onSave: (payload: CreateZonePayload | UpdateZonePayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const ZONE_TYPES = Object.entries(ZONE_TYPE_META) as [ZoneType, { label: string }][];

interface FormState {
  name: string;
  type: ZoneType;
  parentId: string;
}

const empty: FormState = { name: '', type: 'MUNICIPALITY', parentId: '' };

export function ZoneModal({ open, zone, allZones, onClose, onSave, isSubmitting = false }: ZoneModalProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (zone) {
      setForm({ name: zone.name, type: zone.type, parentId: zone.parentId ?? '' });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [zone, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const parentOptions = allZones.filter((z) => z.id !== zone?.id);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload: CreateZonePayload = {
      name: form.name.trim(),
      type: form.type,
      parentId: form.parentId || undefined,
    };
    await onSave(payload, zone?.id);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

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
                    <Map className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{zone ? 'Modifier la zone' : 'Nouvelle zone'}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{zone ? `ID: ${zone.id}` : 'Remplir les informations'}</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Field label="Nom *" error={errors.name}>
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={`${inputCls} ${errors.name ? 'border-[#D94035]' : ''}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom de la zone" />
                </Field>

                <Field label="Type">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select className={`${inputCls} appearance-none`} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ZoneType }))}>
                    {ZONE_TYPES.map(([val, m]) => (
                      <option key={val} value={val}>{m.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Zone parente">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select className={`${inputCls} appearance-none`} value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
                    <option value="">— Aucune (racine) —</option>
                    {parentOptions.map((z) => (
                      <option key={z.id} value={z.id}>{z.name} ({ZONE_TYPE_META[z.type].label})</option>
                    ))}
                  </select>
                </Field>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                    <ToggleLeft className="w-4 h-4" />
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-[#D94035] mt-1">{error}</p>}
    </div>
  );
}
