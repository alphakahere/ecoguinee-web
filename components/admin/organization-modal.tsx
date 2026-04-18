'use client';

import { useState, useMemo } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	X,
	Building2,
	Mail,
	Phone,
	MapPin,
	FileText,
	ChevronDown,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { organizationFormSchema, type OrganizationFormInput } from '@/lib/validations/organization.schema';
import { flattenTree } from "@/lib/utils";
import type { ApiOrganization, ApiZone, CreateOrganizationPayload, UpdateOrganizationPayload } from '@/types/api';

interface OrganizationModalProps {
  open: boolean;
  organization?: ApiOrganization | null;
  zones: ApiZone[];
  onClose: () => void;
  onSave: (payload: CreateOrganizationPayload | UpdateOrganizationPayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

function getQuartiers(municipality: ApiZone): ApiZone[] {
	return (municipality.children ?? []).filter(
		(z) => z.type === "NEIGHBORHOOD" || z.type === "DISTRICT",
	);
}

export function OrganizationModal({ open, organization, zones, onClose, onSave, isSubmitting = false }: OrganizationModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <OrganizationModalInner
          key={organization?.id ?? 'new'}
          organization={organization}
          zones={zones}
          onClose={onClose}
          onSave={onSave}
          isSubmitting={isSubmitting}
        />
      )}
    </AnimatePresence>
  );
}

function OrganizationModalInner({
  organization,
  zones,
  onClose,
  onSave,
  isSubmitting = false,
}: Omit<OrganizationModalProps, 'open'>) {
  const [zoneIds, setZoneIds] = useState(() =>
		(organization?.zones ?? []).map((z) => z.id),
  );


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormInput>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name ?? '',
      acronym: organization?.acronym ?? '',
      email: organization?.email ?? '',
      phone: organization?.phone ?? '',
      address: organization?.address ?? '',
      description: organization?.description ?? '',
      activityType: organization?.activityType ?? '',
    },
  });

  const municipalities = useMemo(
		() => flattenTree(zones).filter((z) => z.type === "MUNICIPALITY"),
		[zones],
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const selectedSet = useMemo(() => new Set(zoneIds), [zoneIds]);

  const toggleExpanded = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
  };

  const isQuartierChecked = (m: ApiZone, qid: string) =>
		selectedSet.has(m.id) || selectedSet.has(qid);

  const toggleQuartier = (m: ApiZone, qid: string) => {
		setZoneIds((prev) => {
			// If the whole-commune wildcard is on, unchecking one quartier
			// expands the wildcard into the explicit list of the others.
			if (prev.includes(m.id)) {
				const others = getQuartiers(m)
					.map((q) => q.id)
					.filter((id) => id !== qid);
				return [...prev.filter((id) => id !== m.id), ...others];
			}
			return prev.includes(qid)
				? prev.filter((id) => id !== qid)
				: [...prev, qid];
		});
  };

  const toggleCommune = (m: ApiZone) => {
		const quartiers = getQuartiers(m);
		if (quartiers.length === 0) {
			setZoneIds((prev) =>
				prev.includes(m.id)
					? prev.filter((id) => id !== m.id)
					: [...prev, m.id],
			);
			return;
		}
		const qIds = new Set(quartiers.map((q) => q.id));
		const state = communeState(m);
		if (state === "all") {
			// Clear: remove wildcard and any explicit quartier ids under this commune.
			setZoneIds((prev) =>
				prev.filter((id) => id !== m.id && !qIds.has(id)),
			);
		} else {
			// Mark all: store commune id as wildcard, drop redundant quartier ids.
			setZoneIds((prev) => [
				...prev.filter((id) => !qIds.has(id)),
				m.id,
			]);
		}
  };

  const communeState = (m: ApiZone): "all" | "some" | "none" => {
		if (selectedSet.has(m.id)) return "all";
		const quartiers = getQuartiers(m);
		if (quartiers.length === 0) return "none";
		const qIds = quartiers.map((q) => q.id);
		const selectedCount = qIds.filter((id) =>
			selectedSet.has(id),
		).length;
		if (selectedCount === 0) return "none";
		if (selectedCount === qIds.length) return "all";
		return "some";
  };

  const onValid = async (data: OrganizationFormInput) => {
    const payload: CreateOrganizationPayload = {
      name: data.name.trim(),
      acronym: data.acronym?.trim().toUpperCase() || undefined,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      description: data.description?.trim() || undefined,
      activityType: data.activityType?.trim() || undefined,
      zoneIds: zoneIds.length > 0 ? zoneIds : undefined,
    };
    await onSave(payload, organization?.id);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
				onClick={onClose}
			/>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{
					type: "spring",
					stiffness: 350,
					damping: 30,
				}}
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
								<h2 className="font-semibold text-sm">
									{organization
										? "Modifier l'organisation"
										: "Nouvelle organisation"}
								</h2>
								<p className="text-xs text-muted-foreground font-mono">
									{organization
										? `ID: ${organization.id}`
										: "Remplir les informations"}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Form */}
					<form
						onSubmit={handleSubmit(onValid)}
						className="p-6 space-y-4 overflow-y-auto"
					>
						<fieldset
							disabled={isSubmitting}
							className="space-y-4 disabled:opacity-60"
						>
							<Field
								label="Nom *"
								error={errors.name?.message}
							>
								<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<input
									{...register("name")}
									className={`${inputCls} ${errors.name ? "border-destructive" : ""}`}
									placeholder="Nom de l'organisation"
								/>
							</Field>

							<Field
								label="Acronyme"
								error={errors.acronym?.message}
							>
								<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<input
									{...register("acronym")}
									maxLength={10}
									className={`${inputCls} uppercase ${errors.acronym ? "border-destructive" : ""}`}
									placeholder="Ex: LVG"
								/>
							</Field>

							<div className="grid grid-cols-2 gap-4">
								<Field
									label="Email"
									error={
										errors.email
											?.message
									}
								>
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										type="email"
										{...register(
											"email",
										)}
										className={`${inputCls} ${errors.email ? "border-destructive" : ""}`}
										placeholder="contact@organisation.gn"
									/>
								</Field>
								<Field
									label="Téléphone"
									error={
										errors.phone
											?.message
									}
								>
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										{...register(
											"phone",
										)}
										className={`${inputCls} ${errors.phone ? "border-destructive" : ""}`}
										placeholder="622 222 817"
									/>
								</Field>
							</div>

							<Field label="Adresse">
								<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<input
									{...register("address")}
									className={inputCls}
									placeholder="Adresse"
								/>
							</Field>

							<Field label="Type d'activité">
								<FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<input
									{...register(
										"activityType",
									)}
									className={inputCls}
									placeholder="Ex: Collecte de déchets"
								/>
							</Field>

							<div>
								<label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
									Description
								</label>
								<textarea
									{...register(
										"description",
									)}
									className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border resize-none"
									rows={3}
									placeholder="Description de l'organisation…"
								/>
							</div>

							{/* Zone picker */}
							<div>
								<label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">
									Communes et quartiers
									couverts
								</label>
								<div className="border border-border rounded-lg bg-muted/20 max-h-80 overflow-y-auto divide-y divide-border">
									{municipalities.length ===
									0 ? (
										<p className="text-xs text-muted-foreground p-3">
											Aucune commune
											disponible
										</p>
									) : (
										municipalities.map(
											(
												municipality,
											) => {
												const quartiers =
													getQuartiers(
														municipality,
													);
												const state =
													communeState(
														municipality,
													);
												const isExpanded =
													expanded.has(
														municipality.id,
													);
												const hasQuartiers =
													quartiers.length >
													0;
												const wholeCommune =
													selectedSet.has(
														municipality.id,
													);
												const selectedCount =
													wholeCommune
														? quartiers.length
														: quartiers.filter(
																(
																	q,
																) =>
																	selectedSet.has(
																		q.id,
																	),
															)
																.length;

												return (
													<div
														key={
															municipality.id
														}
													>
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
																checked={
																	state ===
																	"all"
																}
																ref={(
																	el,
																) => {
																	if (
																		el
																	)
																		el.indeterminate =
																			state ===
																			"some";
																}}
																onChange={() =>
																	toggleCommune(
																		municipality,
																	)
																}
																className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
															/>
															<span className="text-sm font-semibold flex-1">
																{
																	municipality.name
																}
															</span>
															{hasQuartiers && (
																<span className="text-[11px] font-mono text-muted-foreground">
																	{
																		selectedCount
																	}

																	/
																	{
																		quartiers.length
																	}
																</span>
															)}
														</div>
														{hasQuartiers &&
															isExpanded && (
																<div className="pl-10 pr-3 pb-2 bg-muted/10">
																	{quartiers.map(
																		(
																			q,
																		) => {
																			const isSelected =
																				isQuartierChecked(
																					municipality,
																					q.id,
																				);
																			return (
																				<label
																					key={
																						q.id
																					}
																					className="flex items-center gap-2 py-1.5 cursor-pointer"
																				>
																					<input
																						type="checkbox"
																						checked={
																							isSelected
																						}
																						onChange={() =>
																							toggleQuartier(
																								municipality,
																								q.id,
																							)
																						}
																						className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
																					/>
																					<span className="text-sm flex-1">
																						{
																							q.name
																						}
																					</span>
																					{q.code && (
																						<span className="text-[11px] font-mono text-muted-foreground">
																							{
																								q.code
																							}
																						</span>
																					)}
																				</label>
																			);
																		},
																	)}
																</div>
															)}
													</div>
												);
											},
										)
									)}
								</div>
							</div>
						</fieldset>

						<div className="flex justify-end gap-3 pt-2 border-t border-border">
							<button
								type="button"
								onClick={onClose}
								disabled={isSubmitting}
								className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-60"
							>
								{isSubmitting && (
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
								)}
								{isSubmitting
									? "En cours…"
									: "Enregistrer"}
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
