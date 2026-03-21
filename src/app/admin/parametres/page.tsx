'use client';

import { useState, useEffect } from 'react';
import { Bell, Globe, Database, Server } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STORAGE_KEY = 'eco-settings';

interface Settings {
  platformName: string;
  emailNotif: boolean;
  autoAssign: boolean;
  maintenanceMode: boolean;
}

const DEFAULTS: Settings = {
  platformName: 'EcoGuinée',
  emailNotif: true,
  autoAssign: true,
  maintenanceMode: false,
};

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success('Paramètres enregistrés avec succès !');
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
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
            <input
              value={settings.platformName}
              onChange={(e) => update('platformName', e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono w-48 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
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
          {([
            { key: 'emailNotif' as const, label: 'Notifications par email', description: 'Envoyer des emails aux agents et superviseurs' },
            { key: 'autoAssign' as const, label: 'Assignation automatique', description: 'Assigner automatiquement les signalements aux PME' },
          ]).map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{item.description}</p>
              </div>
              <button
                onClick={() => update(item.key, !settings[item.key])}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings[item.key] ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings[item.key] ? 'left-6' : 'left-1'}`} />
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
              onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-[#D94035]' : 'bg-muted'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.maintenanceMode ? 'left-6' : 'left-1'}`} />
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
