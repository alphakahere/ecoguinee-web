'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Shield, Globe, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

const STORAGE_KEY = 'eco-sup-settings';

interface Settings {
  emailNotif: boolean;
  pushNotif: boolean;
  criticalOnly: boolean;
}

const DEFAULTS: Settings = { emailNotif: true, pushNotif: true, criticalOnly: false };

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

const ROLE_LABELS: Record<string, string> = {
  MANAGER: 'Manager',
  SUPERVISOR: 'Superviseur',
};

export default function SuperviseurParametresPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: overview } = useSupervisorOverview();
  const pme = overview?.pme;

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
    toast.success('Paramètres enregistrés');
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Configuration de votre espace superviseur" />

      {/* Profile */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Informations du compte</h3>
        <div className="space-y-3">
          {[
            { icon: Shield, label: 'Nom', value: currentUser?.name ?? '—' },
            { icon: Mail, label: 'Email', value: currentUser?.email ?? '—' },
            { icon: Phone, label: 'Téléphone', value: currentUser?.phone ?? '—' },
            { icon: Shield, label: 'Rôle', value: ROLE_LABELS[currentUser?.role ?? ''] ?? currentUser?.role ?? '—' },
            { icon: Globe, label: 'Organisation', value: pme?.name ?? '—' },
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
          {([
            { key: 'emailNotif' as const, label: 'Notifications par email', description: 'Recevoir les alertes par email' },
            { key: 'pushNotif' as const, label: 'Notifications push', description: 'Recevoir les notifications en temps réel' },
            { key: 'criticalOnly' as const, label: 'Critiques uniquement', description: 'Ne recevoir que les signalements critiques' },
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

      {/* Zones */}
      {pme && pme.zones.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">Périmètre géographique</h3>
          <div className="flex flex-wrap gap-2">
            {pme.zones.map((z) => (
              <span key={z.id} className="px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                {z.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
