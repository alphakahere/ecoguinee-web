'use client';

import { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  SUPERVISOR: 'Superviseur',
  AGENT: 'Agent',
  USER: 'Utilisateur',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminProfilPage() {
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useUpdateUser();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) {
    return (
      <div className="flex justify-center py-16">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const name = currentUser.name ?? '—';
  const role = ROLE_LABELS[currentUser.role] ?? currentUser.role;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error('Le nouveau mot de passe est requis');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await updateUser.mutateAsync({
        id: currentUser.id,
        payload: { password: newPassword },
      });
      toast.success('Mot de passe mis à jour');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Impossible de changer le mot de passe');
    }
  };

  const infoRows = [
    { icon: Mail, label: 'Email', value: currentUser.email ?? '—' },
    { icon: Phone, label: 'Téléphone', value: currentUser.phone ?? '—' },
    { icon: Shield, label: 'Rôle', value: role },
    {
      icon: Calendar,
      label: 'Membre depuis',
      value: currentUser.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : '—',
    },
    {
      icon: User,
      label: 'Dernière connexion',
      value: currentUser.lastLogin
        ? new Date(currentUser.lastLogin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—',
    },
  ];

  const inputCls =
    'w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon Profil</h1>

      {/* User info card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="bg-primary/5 border-b border-border px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            {initials(name)}
          </div>
          <div>
            <h2 className="font-bold text-lg">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">{role}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {infoRows.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-mono">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password change card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Changer le mot de passe</h3>
            <p className="text-xs text-muted-foreground font-mono">Minimum 6 caractères</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateUser.isPending} className="font-mono text-xs">
              {updateUser.isPending ? 'En cours…' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
