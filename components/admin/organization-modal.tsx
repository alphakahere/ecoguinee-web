'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	X,
	Building2,
	Mail,
	Phone,
	MapPin,
	FileText,
	Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { organizationFormSchema, type OrganizationFormInput } from '@/lib/validations/organization.schema';
import type { ApiOrganization, ApiZone, CreateOrganizationPayload, UpdateOrganizationPayload } from '@/types/api';

interface OrganizationModalProps {
  open: boolean;
  organization?: ApiOrganization | null;
  zones: ApiZone[];
  onClose: () => void;
  onSave: (payload: CreateOrganizationPayload | UpdateOrganizationPayload, id?: string) => void | Promise<void>;
  isSubmitting?: boolean;
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

  const municipalities = useMemo(() => zones.filter((z) => z.type === 'MUNICIPALITY'), [zones]);

  const toggleMunicipality = (municipalityId: string) => {
		setZoneIds((prev) =>
			prev.includes(municipalityId)
				? prev.filter((id) => id !== municipalityId)
				: [...prev, municipalityId],
		);
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
									Communes couvertes
								</label>
								<div className="border border-border rounded-lg bg-muted/20 max-h-80 overflow-y-auto flex flex-wrap">
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
												const isSelected =
													zoneIds.includes(
														municipality.id,
													);
												return (
													<label
														key={
															municipality.id
														}
														className="flex items-center gap-2 p-3 border-b border-border last:border-b-0 hover:bg-muted/40 cursor-pointer transition-colors"
													>
														<input
															type="checkbox"
															checked={
																isSelected
															}
															onChange={() =>
																toggleMunicipality(
																	municipality.id,
																)
															}
															className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
														/>
														<span className="text-sm font-semibold flex-1">
															{
																municipality.name
															}
														</span>
													</label>
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
