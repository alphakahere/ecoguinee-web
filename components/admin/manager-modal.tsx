'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  managerStepSchema,
  type ManagerStepInput,
} from '@/lib/validations/organization.schema';

interface ManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ManagerStepInput) => void | Promise<void>;
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

export function ManagerModal({ open, onClose, onSave, isSubmitting = false }: ManagerModalProps) {
  return (
    <AnimatePresence>
      {open && <ManagerModalInner onClose={onClose} onSave={onSave} isSubmitting={isSubmitting} />}
    </AnimatePresence>
  );
}

function ManagerModalInner({
  onClose,
  onSave,
  isSubmitting,
}: Omit<ManagerModalProps, 'open'>) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ManagerStepInput>({
    resolver: zodResolver(managerStepSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setValue('password', generatePassword());
  }, [setValue]);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(getValues('password'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border';

  const onValid = async (data: ManagerStepInput) => {
    await onSave({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
    });
  };

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
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      >
        <div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onValid)} className="p-6 space-y-4 overflow-y-auto">
            <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-60">
              <Field label="Nom complet *" error={errors.name?.message}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('name')}
                  className={`${inputCls} ${errors.name ? 'border-destructive' : ''}`}
                  placeholder="Nom complet du manager"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *" error={errors.email?.message}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`${inputCls} ${errors.email ? 'border-destructive' : ''}`}
                    placeholder="manager@org.gn"
                  />
                </Field>
                <Field label="Téléphone *" error={errors.phone?.message}>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('phone')}
                    className={`${inputCls} ${errors.phone ? 'border-destructive' : ''}`}
                    placeholder="+224 622 00 00 00"
                  />
                </Field>
              </div>

              <Field label="Mot de passe *" error={errors.password?.message}>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputCls} pr-20 ${errors.password ? 'border-destructive' : ''}`}
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
            </fieldset>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  'Créer le manager'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

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
