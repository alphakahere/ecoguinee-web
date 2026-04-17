'use client';

import { useEffect, useState } from 'react';
import { X, Map, Layers, Loader2, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ApiOrganization, ApiZone, CreateZonePayload, FloodRisk, UpdateZonePayload, ZoneType } from '@/types/api';
import { ZONE_TYPE_META } from '@/types/api';

const FLOOD_RISK_OPTIONS: { value: FloodRisk; label: string }[] = [
  { value: 'LOW',       label: 'Faible' },
  { value: 'MEDIUM',    label: 'Moyen' },
  { value: 'HIGH',      label: 'Élevé' },
  { value: 'VERY_HIGH', label: 'Très élevé' },
];

interface ZoneModalProps {
  open: boolean;
  zone?: ApiZone | null;
  allZones: ApiZone[];
  organizations?: ApiOrganization[];
  defaultParentId?: string;
  onClose: () => void;
  onSave: (payload: CreateZonePayload | UpdateZonePayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const ZONE_TYPES = Object.entries(ZONE_TYPE_META) as [ZoneType, { label: string }][];

interface FormState {
  name: string;
  code: string;
  type: ZoneType;
  floodRisk: FloodRisk | '';
  parentId: string;
  organizationIds: string[];
  leadOrganizationId: string;
}

const empty: FormState = {
  name: '', code: '', type: 'MUNICIPALITY', floodRisk: '', parentId: '',
  organizationIds: [], leadOrganizationId: '',
};

export function ZoneModal({
  open, zone, allZones, organizations = [], defaultParentId = '',
  onClose, onSave, isSubmitting = false,
}: ZoneModalProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (zone) {
      // Tree nodes don't include `organizations` (relation); zoneDetail does.
      // Fall back to including leadOrganizationId so the lead select is visible immediately.
      const orgIds = zone.organizations
        ? zone.organizations.map((o) => o.id)
        : zone.leadOrganizationId
          ? [zone.leadOrganizationId]
          : [];

      setForm({
        name: zone.name,
        code: zone.code ?? '',
        type: zone.type,
        floodRisk: zone.floodRisk ?? '',
        parentId: zone.parentId ?? '',
        organizationIds: orgIds,
        leadOrganizationId: zone.leadOrganizationId ?? '',
      });
    } else {
      setForm({ ...empty, parentId: defaultParentId });
    }
    setErrors({});
  }, [zone?.id, open, defaultParentId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const parentOptions = allZones.filter((z) => z.id !== zone?.id);
  const isMunicipality = form.type === 'MUNICIPALITY';

  const toggleOrg = (id: string) => {
    setForm((f) => {
      const next = f.organizationIds.includes(id)
        ? f.organizationIds.filter((oid) => oid !== id)
        : [...f.organizationIds, id];
      return {
        ...f,
        organizationIds: next,
        leadOrganizationId: next.includes(f.leadOrganizationId) ? f.leadOrganizationId : '',
      };
    });
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload: CreateZonePayload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      type: form.type,
      floodRisk: form.floodRisk || undefined,
      parentId: form.parentId || undefined,
      leadOrganizationId: form.leadOrganizationId || undefined,
      organizationIds: isMunicipality ? form.organizationIds : undefined,
    };
    await onSave(payload, zone?.id);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  const selectedOrgs = organizations.filter((o) => form.organizationIds.includes(o.id));

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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-border overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
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

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-60">
                  <Field label="Nom *" error={errors.name}>
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className={`${inputCls} ${errors.name ? 'border-[#D94035]' : ''}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom de la zone" />
                  </Field>

                  <Field label="Code officiel">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="Ex: CKY0101" />
                  </Field>

                  <Field label="Risque d'inondation">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select className={`${inputCls} appearance-none`} value={form.floodRisk} onChange={(e) => setForm((f) => ({ ...f, floodRisk: e.target.value as FloodRisk | '' }))}>
                      <option value="">— Aucun —</option>
                      {FLOOD_RISK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>

                  <Field label="Type">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select className={`${inputCls} appearance-none`} value={form.type} onChange={(e) => {
                      const newType = e.target.value as ZoneType;
                      setForm((f) => ({ ...f, type: newType, parentId: newType === 'REGION' ? '' : f.parentId }));
                    }}>
                      {ZONE_TYPES.map(([val, m]) => (
                        <option key={val} value={val}>{m.label}</option>
                      ))}
                    </select>
                  </Field>

                  {form.type !== 'REGION' && (
                    <Field label="Zone parente">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select className={`${inputCls} appearance-none`} value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
                        <option value="">— Aucune (racine) —</option>
                        {parentOptions.map((z) => (
                          <option key={z.id} value={z.id}>{z.name} ({ZONE_TYPE_META[z.type].label})</option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {isMunicipality && organizations.length > 0 && (
                    <>
                      <div>
                        <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                          Organisations couvrant cette commune
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {organizations.map((org) => {
                            const checked = form.organizationIds.includes(org.id);
                            return (
                              <button
                                key={org.id}
                                type="button"
                                onClick={() => toggleOrg(org.id)}
                                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                                  checked
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:bg-muted/60'
                                }`}
                              >
                                {org.acronym ?? org.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {selectedOrgs.length > 0 && (
                        <div>
                          <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <Star className="w-3 h-3" /> Chef de file
                          </label>
                          <div className="relative">
                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                              className={`${inputCls} appearance-none`}
                              value={form.leadOrganizationId}
                              onChange={(e) => setForm((f) => ({ ...f, leadOrganizationId: e.target.value }))}
                            >
                              <option value="">— Aucun —</option>
                              {selectedOrgs.map((org) => (
                                <option key={org.id} value={org.id}>{org.acronym ?? org.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  </fieldset>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
