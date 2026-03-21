'use client';

import { useEffect, useState } from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, MapPin, ToggleLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROLE_META } from '@/lib/types';
import type { User, UserRole, UserStatus } from '@/lib/types';

interface UserModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }) => void;
}

const COMMUNES = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto'];
const ROLE_OPTIONS: { value: UserRole; label: string }[] =
  (Object.entries(ROLE_META) as [UserRole, { label: string }][]).map(([value, m]) => ({ value, label: m.label }));
const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' },
];

const empty = { name: '', email: '', phone: '', role: 'AGENT' as UserRole, territoire: '', status: 'active' as UserStatus };

export function UserModal({ open, user, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email ?? '', phone: user.phone, role: user.role, territoire: user.territoire ?? '', status: user.status });
    else setForm(empty);
    setErrors({});
  }, [user, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.phone.trim()) e.phone = 'Le téléphone est requis';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...(user ? { id: user.id } : {}), ...form, territoire: form.territoire || undefined });
    onClose();
  };

  const inputCls = 'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

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
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">{user ? "Modifier l'Utilisateur" : 'Nouvel Utilisateur'}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{user ? `ID: ${user.id}` : 'Remplir les informations'}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Field label="Nom complet" error={errors.name}>
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={`${inputCls} ${errors.name ? 'border-[#D94035]' : ''}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Mamadou Diallo" />
                </Field>

                <Field label="Adresse email" error={errors.email}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" className={`${inputCls} ${errors.email ? 'border-[#D94035]' : ''}`} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="exemple@ecoguinee.gn" />
                </Field>

                <Field label="Téléphone" error={errors.phone}>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className={`${inputCls} ${errors.phone ? 'border-[#D94035]' : ''}`} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+224 6XX XX XX XX" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Rôle</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select className={`${inputCls} appearance-none`} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
                        {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Territoire</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select className={`${inputCls} appearance-none`} value={form.territoire} onChange={(e) => setForm((f) => ({ ...f, territoire: e.target.value }))}>
                        <option value="">— Aucune —</option>
                        {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wide">Statut du compte</label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s.value} type="button" onClick={() => setForm((f) => ({ ...f, status: s.value }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
                          form.status === s.value
                            ? s.value === 'active' ? 'bg-[#6FCF4A]/20 border-[#6FCF4A] text-[#6FCF4A]'
                            : s.value === 'suspended' ? 'bg-[#D94035]/20 border-[#D94035] text-[#D94035]'
                            : 'bg-[#E8A020]/20 border-[#E8A020] text-[#E8A020]'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg text-sm font-mono bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4" />
                    {user ? 'Enregistrer' : "Créer l'utilisateur"}
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
