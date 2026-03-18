'use client';

import { Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';

const AGENT = {
  name: 'Fatoumata Camara',
  email: 'fatoumata.camara@ecoguinee.gn',
  phone: '+224 622 10 20 30',
  role: 'Agent',
  territoire: 'Dixinn',
  createdAt: '2025-04-10',
  lastLogin: '2026-03-12T09:00:00',
};

export default function AgentProfilPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            FC
          </div>
          <div>
            <h2 className="font-bold text-lg">{AGENT.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#6FCF4A]" />
              <span className="text-xs font-mono text-muted-foreground">{AGENT.role} · {AGENT.territoire}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {[
            { icon: Mail, label: 'Email', value: AGENT.email },
            { icon: Phone, label: 'Téléphone', value: AGENT.phone },
            { icon: MapPin, label: 'Territoire', value: AGENT.territoire },
            { icon: Shield, label: 'Rôle', value: AGENT.role },
            { icon: Calendar, label: 'Membre depuis', value: new Date(AGENT.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
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
