'use client';

import { useEffect, useState } from 'react';
import { X, Building2, Mail, Phone, MapPin, FileText, ToggleLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ApiSME, ApiZone, CreateSMEPayload, UpdateSMEPayload } from '@/types/api';

interface SMEModalProps {
  open: boolean;
  sme?: ApiSME | null;
  zones: ApiZone[];
  onClose: () => void;
  onSave: (payload: CreateSMEPayload | UpdateSMEPayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  activityType: string;
  zoneIds: string[];
}

const empty: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  activityType: '',
  zoneIds: [],
};

export function SMEModal({ open, sme, zones, onClose, onSave, isSubmitting = false }: SMEModalProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (sme) {
      setForm({
        name: sme.name,
        email: sme.email ?? '',
        phone: sme.phone ?? '',
        address: sme.address ?? '',
        description: sme.description ?? '',
        activityType: sme.activityType ?? '',
        zoneIds: (sme.zones ?? []).map((z) => z.id),
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [sme, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload: CreateSMEPayload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined,
      activityType: form.activityType.trim() || undefined,
      zoneIds: form.zoneIds.length > 0 ? form.zoneIds : undefined,
    };
    await onSave(payload, sme?.id);
  };

  const toggleZone = (zoneId: string) => {
    setForm((f) => ({
      ...f,
      zoneIds: f.zoneIds.includes(zoneId)
        ? f.zoneIds.filter((id) => id !== zoneId)
        : [...f.zoneIds, zoneId],
    }));
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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{sme ? 'Modifier l\'organisation' : 'Nouvelle organisation'}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{sme ? `ID: ${sme.id}` : 'Remplir les informations'}</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                <Field label="Nom *" error={errors.name}>
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={`${inputCls} ${errors.name ? 'border-[#D94035]' : ''}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom de l'organisation" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email}>
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" className={`${inputCls} ${errors.email ? 'border-[#D94035]' : ''}`} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="contact@organisation.gn" />
                  </Field>
                  <Field label="Téléphone">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+224 6XX…" />
                  </Field>
                </div>

                <Field label="Adresse">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={inputCls} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Adresse" />
                </Field>

                <Field label="Type d'activité">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={inputCls} value={form.activityType} onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))} placeholder="Ex: Collecte de déchets" />
                </Field>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description de l'organisation…"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">Zones couvertes</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {zones.map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => toggleZone(z.id)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                          form.zoneIds.includes(z.id)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {z.name}
                      </button>
                    ))}
                    {zones.length === 0 && (
                      <p className="text-xs text-muted-foreground">Aucune zone disponible</p>
                    )}
                  </div>
                </div>


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
