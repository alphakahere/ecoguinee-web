'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Building2, Mail, Phone, MapPin, FileText, ToggleLeft, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { smeFormSchema, type SMEFormInput } from '@/lib/validations/sme.schema';
import type { ApiSME, ApiZone, CreateSMEPayload, UpdateSMEPayload } from '@/types/api';

interface SMEModalProps {
  open: boolean;
  sme?: ApiSME | null;
  zones: ApiZone[];
  onClose: () => void;
  onSave: (payload: CreateSMEPayload | UpdateSMEPayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function SMEModal({ open, sme, zones, onClose, onSave, isSubmitting = false }: SMEModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <SMEModalInner
          key={sme?.id ?? 'new'}
          sme={sme}
          zones={zones}
          onClose={onClose}
          onSave={onSave}
          isSubmitting={isSubmitting}
        />
      )}
    </AnimatePresence>
  );
}

function SMEModalInner({
  sme,
  zones,
  onClose,
  onSave,
  isSubmitting = false,
}: Omit<SMEModalProps, 'open'>) {
  const [zoneIds, setZoneIds] = useState(() => (sme?.zones ?? []).map((z) => z.id));
  const [expandedMunicipalities, setExpandedMunicipalities] = useState<Set<string>>(() => new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SMEFormInput>({
    resolver: zodResolver(smeFormSchema),
    defaultValues: {
      name: sme?.name ?? '',
      email: sme?.email ?? '',
      phone: sme?.phone ?? '',
      address: sme?.address ?? '',
      description: sme?.description ?? '',
      activityType: sme?.activityType ?? '',
    },
  });

  const municipalities = useMemo(() => zones.filter((z) => z.type === 'MUNICIPALITY'), [zones]);

  const getNeighborhoods = (municipalityId: string): ApiZone[] => {
    const m = zones.find((z) => z.id === municipalityId);
    return m?.children?.filter((z) => z.type === 'NEIGHBORHOOD') ?? [];
  };

  const toggleMunicipality = (municipalityId: string) => {
    const neighborhoodIds = getNeighborhoods(municipalityId).map((n) => n.id);
    if (neighborhoodIds.length === 0) return;
    setZoneIds((prev) => {
      const allSelected = neighborhoodIds.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !neighborhoodIds.includes(id));
      return Array.from(new Set([...prev, ...neighborhoodIds]));
    });
  };

  const toggleNeighborhood = (neighborhoodId: string) => {
    setZoneIds((prev) =>
      prev.includes(neighborhoodId) ? prev.filter((id) => id !== neighborhoodId) : [...prev, neighborhoodId],
    );
  };

  const toggleExpanded = (municipalityId: string) => {
    setExpandedMunicipalities((prev) => {
      const next = new Set(prev);
      if (next.has(municipalityId)) next.delete(municipalityId);
      else next.add(municipalityId);
      return next;
    });
  };

  const onValid = async (data: SMEFormInput) => {
    const payload: CreateSMEPayload = {
      name: data.name.trim(),
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      description: data.description?.trim() || undefined,
      activityType: data.activityType?.trim() || undefined,
      zoneIds: zoneIds.length > 0 ? zoneIds : undefined,
    };
    await onSave(payload, sme?.id);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      >
        <div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto border border-border overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{sme ? "Modifier l'organisation" : 'Nouvelle organisation'}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{sme ? `ID: ${sme.id}` : 'Remplir les informations'}</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onValid)} className="p-6 space-y-4 overflow-y-auto">
                <Field label="Nom *" error={errors.name?.message}>
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('name')}
                    className={`${inputCls} ${errors.name ? 'border-destructive' : ''}`}
                    placeholder="Nom de l'organisation"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email?.message}>
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      {...register('email')}
                      className={`${inputCls} ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="contact@organisation.gn"
                    />
                  </Field>
                  <Field label="Téléphone" error={errors.phone?.message}>
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register('phone')}
                      className={`${inputCls} ${errors.phone ? 'border-destructive' : ''}`}
                      placeholder="622 222 817"
                    />
                  </Field>
                </div>

                <Field label="Adresse">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register('address')} className={inputCls} placeholder="Adresse" />
                </Field>

                <Field label="Type d'activité">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register('activityType')} className={inputCls} placeholder="Ex: Collecte de déchets" />
                </Field>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border resize-none"
                    rows={3}
                    placeholder="Description de l'organisation…"
                  />
                </div>

                {/* Zone picker */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
                    Communes et quartiers couverts
                  </label>
                  <div className="border border-border rounded-lg bg-muted/20 max-h-80 overflow-y-auto">
                    {municipalities.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3">Aucune commune disponible</p>
                    ) : (
                      municipalities.map((municipality) => {
                        const neighborhoods = getNeighborhoods(municipality.id);
                        const isExpanded = expandedMunicipalities.has(municipality.id);
                        const selectedCount = zoneIds.filter((id) => neighborhoods.some((n) => n.id === id)).length;
                        const isMunicipalitySelected = neighborhoods.length > 0 && neighborhoods.every((n) => zoneIds.includes(n.id));

                        return (
                          <div key={municipality.id} className="border-b border-border last:border-b-0">
                            <div className={`flex items-center gap-2 p-3 transition-colors ${neighborhoods.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/40'}`}>
                              <input
                                type="checkbox"
                                checked={isMunicipalitySelected}
                                onChange={() => toggleMunicipality(municipality.id)}
                                disabled={neighborhoods.length === 0}
                                className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0 disabled:cursor-not-allowed"
                              />
                              <button
                                type="button"
                                onClick={() => toggleExpanded(municipality.id)}
                                disabled={neighborhoods.length === 0}
                                className="flex items-center gap-2 flex-1 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronDown
                                  className="w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0"
                                  style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                                />
                                <span className="text-sm font-semibold flex-1">{municipality.name}</span>
                              </button>
                              {neighborhoods.length > 0 ? (
                                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                                  {selectedCount}/{neighborhoods.length}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap italic">Aucun quartier</span>
                              )}
                            </div>

                            {isExpanded && neighborhoods.length > 0 && (
                              <div className="bg-muted/10 border-t border-border space-y-1 p-2 pl-10">
                                {neighborhoods.map((neighborhood) => (
                                  <button
                                    key={neighborhood.id}
                                    type="button"
                                    onClick={() => toggleNeighborhood(neighborhood.id)}
                                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={zoneIds.includes(neighborhood.id)}
                                      onChange={() => {}}
                                      className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
                                    />
                                    <span className="text-xs font-mono text-muted-foreground flex-1">{neighborhood.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                    <ToggleLeft className="w-4 h-4" />
                    {isSubmitting ? 'En cours…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
      </motion.div>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
