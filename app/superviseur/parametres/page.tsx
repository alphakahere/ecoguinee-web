'use client';

import { useState } from 'react';
import { Bell, Mail, Shield, Globe } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PME_PROFILE, SUPERVISEUR } from '@/lib/data/superviseur-data';

export default function SuperviseurParametresPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Paramètres" description="Configuration de votre espace superviseur" />

      {/* Profile info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Informations du compte</h3>
        <div className="space-y-3">
          {[
            { icon: Shield, label: 'Nom', value: SUPERVISEUR.name },
            { icon: Mail, label: 'Email', value: SUPERVISEUR.email },
            { icon: Globe, label: 'PME', value: PME_PROFILE.name },
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

      {/* Notifications */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Notifications par email', description: 'Recevoir les alertes par email', value: emailNotif, onChange: setEmailNotif },
            { label: 'Notifications push', description: 'Recevoir les notifications en temps réel', value: pushNotif, onChange: setPushNotif },
            { label: 'Critiques uniquement', description: 'Ne recevoir que les signalements critiques', value: criticalOnly, onChange: setCriticalOnly },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{item.description}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${item.value ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Périmètre */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Périmètre géographique</h3>
        <div className="space-y-2">
          <p className="text-sm font-mono text-muted-foreground">Commune : <span className="text-foreground">{PME_PROFILE.commune}</span></p>
          <p className="text-sm font-mono text-muted-foreground">Secteurs :</p>
          <div className="flex flex-wrap gap-2">
            {PME_PROFILE.secteurs.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
