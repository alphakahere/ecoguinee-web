'use client';

import { useState } from 'react';
import { Bell, Globe, Database, Server } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminParametresPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès !');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Paramètres" description="Configuration de la plateforme" />

      {/* General */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Général</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Nom de la plateforme</p>
              <p className="text-xs font-mono text-muted-foreground">Affiché partout sur le site</p>
            </div>
            <input defaultValue="EcoGuinée" className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono w-48 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Langue par défaut</p>
              <p className="text-xs font-mono text-muted-foreground">Langue de l&apos;interface</p>
            </div>
            <span className="text-sm font-mono px-3 py-2 rounded-lg border border-border bg-muted/30">Français</span>
          </div>
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
            { label: 'Notifications par email', description: 'Envoyer des emails aux agents et superviseurs', value: emailNotif, onChange: setEmailNotif },
            { label: 'Assignation automatique', description: 'Assigner automatiquement les signalements aux PME', value: autoAssign, onChange: setAutoAssign },
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

      {/* System */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Système</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Mode maintenance</p>
              <p className="text-xs font-mono text-muted-foreground">Désactiver temporairement l&apos;accès public</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-[#D94035]' : 'bg-muted'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${maintenanceMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Version</p>
              <p className="text-xs font-mono text-muted-foreground">Version actuelle de la plateforme</p>
            </div>
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-muted border border-border">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Base de données</p>
              <p className="text-xs font-mono text-muted-foreground">État de la connexion</p>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#6FCF4A]" />
              <span className="text-xs font-mono text-[#6FCF4A]">Connectée</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
