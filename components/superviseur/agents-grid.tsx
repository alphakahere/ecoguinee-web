'use client';

import { MapPin, Wrench, CheckCircle } from 'lucide-react';
import { AGENTS } from '@/lib/data/superviseur-data';

export function AgentsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {AGENTS.map((agent) => (
        <div key={agent.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {agent.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{agent.name}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${agent.active ? 'bg-[#6FCF4A]' : 'bg-muted-foreground'}`} />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {agent.active ? 'En service' : 'Hors service'}
                </span>
              </div>
            </div>
          </div>

          {/* Sector */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">{agent.sector}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Wrench className="w-3.5 h-3.5 text-[#E8A020] mx-auto mb-1" />
              <p className="text-lg font-bold">{agent.interventions}</p>
              <p className="text-[9px] font-mono text-muted-foreground">En cours</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <CheckCircle className="w-3.5 h-3.5 text-[#6FCF4A] mx-auto mb-1" />
              <p className="text-lg font-bold">{agent.resolved}</p>
              <p className="text-[9px] font-mono text-muted-foreground">Résolus</p>
            </div>
          </div>

          {/* Rate bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-muted-foreground">Taux de résolution</span>
              <span className="text-xs font-mono font-bold" style={{ color: agent.rate >= 70 ? '#6FCF4A' : agent.rate >= 50 ? '#E8A020' : '#D94035' }}>
                {agent.rate}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${agent.rate}%`, background: agent.rate >= 70 ? '#6FCF4A' : agent.rate >= 50 ? '#E8A020' : '#D94035' }}
              />
            </div>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground mt-3">{agent.lastActive}</p>
        </div>
      ))}
    </div>
  );
}
