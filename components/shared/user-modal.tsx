'use client';

import { useEffect, useState } from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, ToggleLeft, Trash2, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROLE_META } from '@/lib/types';
import type { User, UserRole, UserStatus } from '@/lib/types';

export type UserModalVariant = 'full' | 'statusOnly';

export interface UserSaveFullPayload {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  territoire?: string;
  status: UserStatus;
  password?: string;
}

interface UserModalProps {
  open: boolean;
  user?: User | null;
  variant: UserModalVariant;
  /** Role fixed to ADMIN (admin creating/editing only admin accounts) */
  roleLockedToAdmin?: boolean;
  onClose: () => void;
  onSaveFull?: (payload: UserSaveFullPayload) => void | Promise<void>;
  onSaveStatus?: (id: string, status: UserStatus) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  canDelete?: boolean;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] =
  (Object.entries(ROLE_META) as [UserRole, { label: string }][]).map(([value, m]) => ({ value, label: m.label }));
const emptyFull: UserSaveFullPayload = {
  name: '',
  email: '',
  phone: '',
  role: 'AGENT',
  territoire: 'Conakry',
  status: 'ACTIVE',
};

export function UserModal({
  open,
  user,
  variant,
  roleLockedToAdmin = false,
  onClose,
  onSaveFull,
  onSaveStatus,
  onDelete,
  canDelete = false,
  isSubmitting = false,
}: UserModalProps) {
  const [form, setForm] = useState<UserSaveFullPayload>(emptyFull);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreate = !user;
  const showPasswordFields = variant === 'full' && isCreate;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email ?? '',
        phone: user.phone,
        role: user.role,
        territoire: user.territoire ?? '',
        status: user.status,
      });
    } else {
      setForm({
        ...emptyFull,
        role: roleLockedToAdmin ? 'ADMIN' : 'AGENT',
      });
    }
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [user, open, roleLockedToAdmin, variant]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const validateFull = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (form.email?.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    }
    if (!form.phone.trim()) e.phone = 'Le téléphone est requis';
    if (showPasswordFields) {
      if (!password.trim()) e.password = 'Le mot de passe est requis';
      else if (password.length < 6) e.password = 'Minimum 6 caractères';
      if (password !== confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (variant === 'statusOnly') {
      if (!user || !onSaveStatus) return;
      await onSaveStatus(user.id, form.status);
      return;
    }
    const errs = validateFull();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (!onSaveFull) return;
    const payload: UserSaveFullPayload = {
      ...(user ? { id: user.id } : {}),
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone.trim(),
      role: roleLockedToAdmin ? 'ADMIN' : form.role,
      territoire: form.territoire || undefined,
      status: form.status,
      ...(showPasswordFields && password ? { password } : {}),
    };
    await onSaveFull(payload);
  };

  const handleDelete = async () => {
    if (!user || !onDelete) return;
    if (!window.confirm(`Supprimer définitivement ${user.name} ?`)) return;
    await onDelete(user.id);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  const title =
    variant === 'statusOnly'
      ? 'Statut du compte'
      : user
        ? "Modifier l'utilisateur"
        : 'Nouvel utilisateur';

  return (
    <AnimatePresence>
      {open && (
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
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div
              className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{title}</h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user ? `ID: ${user.id}` : 'Remplir les informations'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {variant === 'statusOnly' && user && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 text-sm">
                    <p className="font-semibold">{user.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{user.email ?? '—'}</p>
                    <p className="font-mono text-xs">{user.phone}</p>
                    <p className="text-xs">
                      <span className="text-muted-foreground">Rôle : </span>
                      {ROLE_META[user.role].label}
                    </p>
                  </div>
                )}

                {variant === 'full' && (
                  <>
                    <Field label="Nom complet" error={errors.name}>
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={`${inputCls} ${errors.name ? 'border-[#D94035]' : ''}`}
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Ex: Mamadou Diallo"
                      />
                    </Field>

                    <Field label="Adresse email" error={errors.email}>
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        className={`${inputCls} ${errors.email ? 'border-[#D94035]' : ''}`}
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="exemple@ecoguinee.gn"
                      />
                    </Field>

                    <Field label="Téléphone" error={errors.phone}>
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={`${inputCls} ${errors.phone ? 'border-[#D94035]' : ''}`}
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+224 6XX XX XX XX"
                      />
                    </Field>

                    {showPasswordFields && (
                      <>
                        <Field label="Mot de passe" error={errors.password}>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            autoComplete="new-password"
                            className={`${inputCls} ${errors.password ? 'border-[#D94035]' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </Field>
                        <Field label="Confirmer le mot de passe" error={errors.confirmPassword}>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="password"
                            autoComplete="new-password"
                            className={`${inputCls} ${errors.confirmPassword ? 'border-[#D94035]' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </Field>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                          Rôle
                        </label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-1" />
                          <select
                            className={`${inputCls} appearance-none ${roleLockedToAdmin ? 'opacity-70' : ''}`}
                            value={roleLockedToAdmin ? 'ADMIN' : form.role}
                            disabled={roleLockedToAdmin}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {roleLockedToAdmin && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            Compte administrateur uniquement
                          </p>
                        )}
                      </div>
                    </div>

                  </>
                )}

                <div className="flex flex-wrap justify-between gap-3 pt-2 border-t border-border">
                  <div>
                    {canDelete && onDelete && user && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg text-sm font-mono border border-[#D94035]/50 text-[#D94035] hover:bg-[#D94035]/10 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      <ToggleLeft className="w-4 h-4" />
                      {isSubmitting ? 'En cours…' : 'Enregistrer'}
                    </button>
                  </div>
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
