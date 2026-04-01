'use client';

import { useEffect, useState } from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, MapPin, ToggleLeft, Trash2, Lock, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
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
  address?: string;
  territoire?: string;
  status?: UserStatus;
  password?: string;
}

interface UserModalProps {
  open: boolean;
  user?: User | null;
  variant: UserModalVariant;
  /** Role fixed to ADMIN (admin creating/editing only admin accounts) */
  roleLockedToAdmin?: boolean;
  /** Role fixed to AGENT (superviseur gérant son équipe) */
  roleLockedToAgent?: boolean;
  /** Sous-titre contexte (ex. Organisation) */
  contextSubtitle?: string;
  onClose: () => void;
  onSaveFull?: (payload: UserSaveFullPayload) => void | Promise<void>;
  onSaveStatus?: (id: string, status: UserStatus) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  canDelete?: boolean;
  isSubmitting?: boolean;
}

function generatePassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*?';
  const all = upper + lower + digits + special;
  const parts = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  for (let i = parts.length; i < 12; i++) {
    parts.push(all[Math.floor(Math.random() * all.length)]);
  }
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  return parts.join('');
}

const ALL_ROLE_OPTIONS: { value: UserRole; label: string }[] =
  (Object.entries(ROLE_META) as [UserRole, { label: string }][]).map(([value, m]) => ({ value, label: m.label }));

const ADMIN_ROLE_OPTIONS = ALL_ROLE_OPTIONS.filter((r) => r.value === 'ADMIN');
const AGENT_ROLE_OPTIONS = ALL_ROLE_OPTIONS.filter((r) => r.value === 'AGENT');
const emptyFull: UserSaveFullPayload = {
  name: '',
  email: '',
  phone: '',
  role: 'AGENT',
  address: '',
  territoire: '',
};

export function UserModal({
  open,
  user,
  variant,
  roleLockedToAdmin = false,
  roleLockedToAgent = false,
  contextSubtitle,
  onClose,
  onSaveFull,
  onSaveStatus,
  onDelete,
  canDelete = false,
  isSubmitting = false,
}: UserModalProps) {
  const [form, setForm] = useState<UserSaveFullPayload>(emptyFull);
  const [accountStatus, setAccountStatus] = useState<UserStatus>('ACTIVE');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
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
        address: user.address ?? '',
        territoire: user.territoire ?? '',
        status: user.status,
      });
      setAccountStatus(user.status);
    } else {
      setForm({
        ...emptyFull,
        role: roleLockedToAdmin ? 'ADMIN' : roleLockedToAgent ? 'AGENT' : 'AGENT',
      });
    }
    setPassword(user ? '' : generatePassword());
    setShowPassword(false);
    setCopied(false);
    setErrors({});
  }, [user, open, roleLockedToAdmin, roleLockedToAgent, variant]);
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
    }
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (variant === 'statusOnly') {
      if (!user || !onSaveStatus) return;
      await onSaveStatus(user.id, accountStatus);
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
      role: roleLockedToAdmin ? 'ADMIN' : roleLockedToAgent ? 'AGENT' : form.role,
      address: form.address?.trim() || undefined,
      territoire: form.territoire?.trim() || undefined,
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
                      {contextSubtitle ?? (user ? `ID: ${user.id}` : 'Remplir les informations')}
                    </p>
                    {user && contextSubtitle && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {user.id.slice(0, 8)}…
                      </p>
                    )}
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
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 text-sm">
                    <p className="font-semibold">{user.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{user.email ?? '—'}</p>
                    <p className="font-mono text-xs">{user.phone}</p>
                    <p className="text-xs">
                      <span className="text-muted-foreground">Rôle : </span>
                      {ROLE_META[user.role].label}
                    </p>
                    <div>
                      <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                        Statut du compte
                      </label>
                      <select
                        className={`${inputCls} pl-3 appearance-none`}
                        value={accountStatus}
                        onChange={(e) => setAccountStatus(e.target.value as UserStatus)}
                      >
                        <option value="ACTIVE">Actif</option>
                        <option value="INACTIVE">Inactif</option>
                        <option value="SUSPENDED">Suspendu</option>
                      </select>
                    </div>
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

                    <Field label="Adresse">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={inputCls}
                        value={form.address ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="Ex: Kaloum, Conakry"
                      />
                    </Field>

                    <Field label="Territoire">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={inputCls}
                        value={form.territoire ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, territoire: e.target.value }))}
                        placeholder="Ex: Conakry"
                      />
                    </Field>

                    <div>
                      <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                        Statut du compte
                      </label>
                      <select
                        className={`${inputCls} pl-9 appearance-none`}
                        value={form.status ?? 'ACTIVE'}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserStatus }))}
                      >
                        <option value="ACTIVE">Actif</option>
                        <option value="INACTIVE">Inactif</option>
                        <option value="SUSPENDED">Suspendu</option>
                      </select>
                    </div>

                    {showPasswordFields && (
                      <>
                        <Field label="Mot de passe" error={errors.password}>
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className={`${inputCls} pr-24 ${errors.password ? 'border-[#D94035]' : ''}`}
                            value={password}
                            readOnly
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
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
                              onClick={async () => {
                                await navigator.clipboard.writeText(password);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Copier"
                            >
                              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setPassword(generatePassword()); setCopied(false); }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Régénérer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </Field>
                        <p className="text-xs text-muted-foreground -mt-2 ml-1">
                          L&apos;utilisateur devra changer son mot de passe à la première connexion
                        </p>
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
                            className={`${inputCls} appearance-none ${roleLockedToAdmin || roleLockedToAgent ? 'opacity-70' : ''}`}
                            value={roleLockedToAdmin ? 'ADMIN' : roleLockedToAgent ? 'AGENT' : form.role}
                            disabled={roleLockedToAdmin || roleLockedToAgent}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                          >
                            {(roleLockedToAdmin ? ADMIN_ROLE_OPTIONS : roleLockedToAgent ? AGENT_ROLE_OPTIONS : ALL_ROLE_OPTIONS).map((r) => (
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
                        {roleLockedToAgent && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            Agent rattaché à votre organisation
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
