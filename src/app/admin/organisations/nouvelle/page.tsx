'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  Check,
  User,
  Lock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useZoneTree } from '@/hooks/queries/useZones';
import { useCreateOrganization } from '@/hooks/mutations/useCreateOrganization';
import {
  organizationStepSchema,
  managerStepSchema,
  type OrganizationStepInput,
  type ManagerStepInput,
} from '@/lib/validations/organization.schema';
import type { ApiZone, CreateOrganizationPayload } from '@/types/api';

// ── Password generator ─────────────────────────────────────────────────────

function generatePassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*?';
  const all = upper + lower + digits + special;

  // Ensure at least one of each category
  const parts = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = parts.length; i < 12; i++) {
    parts.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join('');
}

// ── Stepper ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Organisation', icon: Building2 },
  { label: 'Manager', icon: User },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={step.label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`h-px w-8 sm:w-12 ${isDone ? 'bg-primary' : 'bg-border'}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-mono transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={`hidden text-xs font-mono sm:inline ${
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                Étape {i + 1} — {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ── Zone Picker (reused from modal pattern) ────────────────────────────────

function ZonePicker({
  zones,
  selectedIds,
  onChange,
  error,
}: {
  zones: ApiZone[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const municipalities = useMemo(
    () => zones.filter((z) => z.type === 'MUNICIPALITY'),
    [zones],
  );

  const getNeighborhoods = (municipalityId: string): ApiZone[] => {
    const m = zones.find((z) => z.id === municipalityId);
    return m?.children?.filter((z) => z.type === 'NEIGHBORHOOD') ?? [];
  };

  const toggleMunicipality = (municipalityId: string) => {
    const nhIds = getNeighborhoods(municipalityId).map((n) => n.id);
    if (nhIds.length === 0) return;
    const allSelected = nhIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !nhIds.includes(id)));
    } else {
      onChange(Array.from(new Set([...selectedIds, ...nhIds])));
    }
  };

  const toggleNeighborhood = (neighborhoodId: string) => {
    if (selectedIds.includes(neighborhoodId)) {
      onChange(selectedIds.filter((id) => id !== neighborhoodId));
    } else {
      onChange([...selectedIds, neighborhoodId]);
    }
  };

  const toggleExpanded = (municipalityId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(municipalityId)) next.delete(municipalityId);
      else next.add(municipalityId);
      return next;
    });
  };

  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
        Communes et quartiers couverts *
      </label>
      <div className="border border-border rounded-lg bg-muted/20 max-h-72 overflow-y-auto">
        {municipalities.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3">Aucune commune disponible</p>
        ) : (
          municipalities.map((municipality) => {
            const neighborhoods = getNeighborhoods(municipality.id);
            const isExpanded = expanded.has(municipality.id);
            const selectedCount = selectedIds.filter((id) =>
              neighborhoods.some((n) => n.id === id),
            ).length;
            const isMunSelected =
              neighborhoods.length > 0 &&
              neighborhoods.every((n) => selectedIds.includes(n.id));

            return (
              <div key={municipality.id} className="border-b border-border last:border-b-0">
                <div
                  className={`flex items-center gap-2 p-3 transition-colors ${
                    neighborhoods.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isMunSelected}
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
                      style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    />
                    <span className="text-sm font-semibold flex-1">{municipality.name}</span>
                  </button>
                  {neighborhoods.length > 0 ? (
                    <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {selectedCount}/{neighborhoods.length}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap italic">
                      Aucun quartier
                    </span>
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
                          checked={selectedIds.includes(neighborhood.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-mono text-muted-foreground flex-1">
                          {neighborhood.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function NewOrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const createOrganization = useCreateOrganization();

  const { data: tree = [] } = useZoneTree();
  const zones = tree[0]?.children ?? [];

  // Step 1 — Organization form
  const orgForm = useForm<OrganizationStepInput>({
    resolver: zodResolver(organizationStepSchema),
    defaultValues: {
      name: '',
      acronym: '',
      email: '',
      phone: '',
      address: '',
      activityType: '',
      zoneIds: [],
    },
  });

  // Step 2 — Manager form
  const mgrForm = useForm<ManagerStepInput>({
    resolver: zodResolver(managerStepSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  // Generate password when arriving at step 2
  useEffect(() => {
    if (step === 1 && !mgrForm.getValues('password')) {
      mgrForm.setValue('password', generatePassword());
    }
  }, [step, mgrForm]);

  // Zone selection (managed separately for reactivity)
  const [zoneIds, setZoneIds] = useState<string[]>([]);

  // Sync zoneIds into react-hook-form
  useEffect(() => {
    orgForm.setValue('zoneIds', zoneIds, { shouldValidate: orgForm.formState.isSubmitted });
  }, [zoneIds, orgForm]);

  // Dirty check for cancel confirmation
  const isDirty = orgForm.formState.isDirty || mgrForm.formState.isDirty || zoneIds.length > 0;

  const handleCancel = () => {
    if (isDirty && !window.confirm('Quitter sans enregistrer ? Les données saisies seront perdues.')) {
      return;
    }
    router.push('/admin/organisations');
  };

  const goToStep2 = useCallback(() => {
    orgForm.handleSubmit(() => setStep(1))();
  }, [orgForm]);

  const handleSubmit = useCallback(async () => {
    const orgData = orgForm.getValues();
    const mgrData = mgrForm.getValues();

    const payload: CreateOrganizationPayload = {
      name: orgData.name.trim(),
      acronym: orgData.acronym?.trim().toUpperCase() || undefined,
      email: orgData.email?.trim() || undefined,
      phone: orgData.phone?.trim() || undefined,
      address: orgData.address?.trim() || undefined,
      activityType: orgData.activityType?.trim() || undefined,
      zoneIds: orgData.zoneIds,
      manager: {
        name: mgrData.name.trim(),
        email: mgrData.email.trim(),
        phone: mgrData.phone.trim(),
        password: mgrData.password,
      },
    };

    try {
      const result = await createOrganization.mutateAsync(payload);
      toast.success(`Organisation « ${result.name} » créée avec succès`);
      router.push(`/admin/organisations/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue';
      toast.error(message);
    }
  }, [orgForm, mgrForm, createOrganization, router]);

  const onStep2Submit = useCallback(() => {
    mgrForm.handleSubmit(handleSubmit)();
  }, [mgrForm, handleSubmit]);

  // Password visibility + copy
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(mgrForm.getValues('password'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Nouvelle organisation</h1>
          <p className="text-xs text-muted-foreground font-mono">Remplir les informations en 2 étapes</p>
        </div>
      </div>

      {/* Progress */}
      <StepIndicator currentStep={step} />

      {/* Step 1 — Organization */}
      {step === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Field label="Nom *" error={orgForm.formState.errors.name?.message}>
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...orgForm.register('name')}
              className={`${inputCls} ${orgForm.formState.errors.name ? 'border-destructive' : ''}`}
              placeholder="Nom de l'organisation"
            />
          </Field>

          <Field label="Acronyme" error={orgForm.formState.errors.acronym?.message}>
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...orgForm.register('acronym')}
              maxLength={10}
              className={`${inputCls} uppercase ${orgForm.formState.errors.acronym ? 'border-destructive' : ''}`}
              placeholder="Ex: LVG"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={orgForm.formState.errors.email?.message}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                {...orgForm.register('email')}
                className={`${inputCls} ${orgForm.formState.errors.email ? 'border-destructive' : ''}`}
                placeholder="contact@org.gn"
              />
            </Field>
            <Field label="Téléphone" error={orgForm.formState.errors.phone?.message}>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...orgForm.register('phone')}
                className={`${inputCls} ${orgForm.formState.errors.phone ? 'border-destructive' : ''}`}
                placeholder="622 222 817"
              />
            </Field>
          </div>

          <Field label="Adresse">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input {...orgForm.register('address')} className={inputCls} placeholder="Adresse" />
          </Field>

          <Field label="Type d'activité">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...orgForm.register('activityType')}
              className={inputCls}
              placeholder="Ex: Collecte de déchets"
            />
          </Field>

          <ZonePicker
            zones={zones}
            selectedIds={zoneIds}
            onChange={setZoneIds}
            error={orgForm.formState.errors.zoneIds?.message}
          />

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="button" onClick={goToStep2}>
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Manager */}
      {step === 1 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Manager principal</h2>
              <p className="text-xs text-muted-foreground font-mono">
                Ce compte sera créé avec le rôle Manager
              </p>
            </div>
          </div>

          <Field label="Nom complet *" error={mgrForm.formState.errors.name?.message}>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...mgrForm.register('name')}
              className={`${inputCls} ${mgrForm.formState.errors.name ? 'border-destructive' : ''}`}
              placeholder="Nom complet du manager"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email *" error={mgrForm.formState.errors.email?.message}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                {...mgrForm.register('email')}
                className={`${inputCls} ${mgrForm.formState.errors.email ? 'border-destructive' : ''}`}
                placeholder="manager@org.gn"
              />
            </Field>
            <Field label="Téléphone *" error={mgrForm.formState.errors.phone?.message}>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...mgrForm.register('phone')}
                className={`${inputCls} ${mgrForm.formState.errors.phone ? 'border-destructive' : ''}`}
                placeholder="+224 622 00 00 00"
              />
            </Field>
          </div>

          {/* Password field */}
          <Field label="Mot de passe *" error={mgrForm.formState.errors.password?.message}>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...mgrForm.register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`${inputCls} pr-20 ${mgrForm.formState.errors.password ? 'border-destructive' : ''}`}
              readOnly
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={copyPassword}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copier"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </Field>
          <p className="text-xs text-muted-foreground -mt-2 ml-1">
            Le manager devra changer son mot de passe à la première connexion
          </p>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              type="button"
              onClick={onStep2Submit}
              disabled={createOrganization.isPending}
            >
              {createOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création…
                </>
              ) : (
                'Créer l\'organisation'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
