'use client';

import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';

const ADMIN = {
  name: 'Amadou Kouyaté',
  email: 'amadou.kouyate@ecoguinee.gn',
  phone: '+224 620 11 22 33',
  role: 'Administrateur',
  createdAt: '2025-01-15',
  lastLogin: '2026-03-12T08:45:00',
};

export default function AdminProfilPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="bg-primary/5 border-b border-border px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            AK
          </div>
          <div>
            <h2 className="font-bold text-lg">{ADMIN.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">{ADMIN.role}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { icon: Mail, label: 'Email', value: ADMIN.email },
            { icon: Phone, label: 'Téléphone', value: ADMIN.phone },
            { icon: Shield, label: 'Rôle', value: ADMIN.role },
            { icon: Calendar, label: 'Membre depuis', value: new Date(ADMIN.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) },
            { icon: User, label: 'Dernière connexion', value: new Date(ADMIN.lastLogin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
          ].map((item) => (
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
    </div>
  );
}
