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
	ArrowLeft,
	ArrowRight,
	ChevronDown,
	ChevronRight,
	Copy,
	Eye,
	EyeOff,
	Check,
	User,
	Lock,
	Loader2,
} from "lucide-react";
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
import { flattenTree } from '@/lib/utils';
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

// ── Zone Picker (communes + quartiers) ─────────────────────────────────────

function getQuartiers(municipality: ApiZone): ApiZone[] {
	return (municipality.children ?? []).filter(
		(z) => z.type === "NEIGHBORHOOD" || z.type === "DISTRICT",
	);
}

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
	const municipalities = useMemo(
		() =>
			flattenTree(zones).filter((z) => z.type === "MUNICIPALITY"),
		[zones],
	);

	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const toggleExpanded = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

	const communeState = (m: ApiZone): "all" | "some" | "none" => {
		const quartiers = getQuartiers(m);
		if (quartiers.length === 0) {
			return selectedSet.has(m.id) ? "all" : "none";
		}
		const qIds = quartiers.map((q) => q.id);
		const selectedCount = qIds.filter((id) => selectedSet.has(id)).length;
		if (selectedCount === 0) return "none";
		if (selectedCount === qIds.length) return "all";
		return "some";
	};

	const toggleQuartier = (qid: string) => {
		onChange(
			selectedSet.has(qid)
				? selectedIds.filter((id) => id !== qid)
				: [...selectedIds, qid],
		);
	};

	const toggleCommune = (m: ApiZone) => {
		const quartiers = getQuartiers(m);
		if (quartiers.length === 0) {
			onChange(
				selectedSet.has(m.id)
					? selectedIds.filter((id) => id !== m.id)
					: [...selectedIds, m.id],
			);
			return;
		}
		const qIds = quartiers.map((q) => q.id);
		const qIdSet = new Set(qIds);
		if (communeState(m) === "all") {
			onChange(selectedIds.filter((id) => !qIdSet.has(id)));
		} else {
			const next = new Set(selectedIds);
			qIds.forEach((id) => next.add(id));
			onChange([...next]);
		}
	};

	return (
		<div>
			<label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
				Communes et quartiers couverts *
			</label>
			<div className="border border-border rounded-lg bg-muted/20 max-h-96 overflow-y-auto divide-y divide-border">
				{municipalities.length === 0 ? (
					<p className="text-xs text-muted-foreground p-3">
						Aucune commune disponible
					</p>
				) : (
					municipalities.map((municipality) => {
						const quartiers = getQuartiers(municipality);
						const state = communeState(municipality);
						const isExpanded = expanded.has(municipality.id);
						const hasQuartiers = quartiers.length > 0;
						const selectedCount = quartiers.filter((q) =>
							selectedSet.has(q.id),
						).length;

						return (
							<div key={municipality.id}>
								<div className="flex items-center gap-2 p-3 hover:bg-muted/40 transition-colors">
									{hasQuartiers ? (
										<button
											type="button"
											onClick={() =>
												toggleExpanded(
													municipality.id,
												)
											}
											className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
											aria-label={
												isExpanded
													? "Réduire"
													: "Développer"
											}
										>
											{isExpanded ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</button>
									) : (
										<span className="w-6 shrink-0" />
									)}
									<input
										type="checkbox"
										checked={state === "all"}
										ref={(el) => {
											if (el)
												el.indeterminate =
													state === "some";
										}}
										onChange={() =>
											toggleCommune(municipality)
										}
										className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
									/>
									<span className="text-sm font-semibold flex-1">
										{municipality.name}
									</span>
									{hasQuartiers && (
										<span className="text-[11px] font-mono text-muted-foreground">
											{selectedCount}/{quartiers.length}
										</span>
									)}
								</div>
								{hasQuartiers && isExpanded && (
									<div className="pl-10 pr-3 pb-2 bg-muted/10">
										{quartiers.map((q) => {
											const isSelected = selectedSet.has(
												q.id,
											);
											return (
												<label
													key={q.id}
													className="flex items-center gap-2 py-1.5 cursor-pointer"
												>
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() =>
															toggleQuartier(q.id)
														}
														className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
													/>
													<span className="text-sm flex-1">
														{q.name}
													</span>
													{q.code && (
														<span className="text-[11px] font-mono text-muted-foreground">
															{q.code}
														</span>
													)}
												</label>
											);
										})}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
			{error && (
				<p className="text-xs text-destructive mt-1">{error}</p>
			)}
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
