'use client';

import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { INTERVENTIONS } from '@/lib/data/superviseur-data';
import { formatDate } from '@/lib/utils';

const COLUMNS = [
  { status: 'reported' as const, label: 'Signalé', icon: AlertTriangle, color: '#D94035', bg: 'bg-[#D94035]/10' },
  { status: 'in-progress' as const, label: 'En cours', icon: Clock, color: '#E8A020', bg: 'bg-[#E8A020]/10' },
  { status: 'resolved' as const, label: 'Résolu', icon: CheckCircle, color: '#6FCF4A', bg: 'bg-[#6FCF4A]/10' },
];

export function InterventionsBoard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = INTERVENTIONS.filter((i) => i.status === col.status);
        return (
          <div key={col.status} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <col.icon className="w-4 h-4" style={{ color: col.color }} />
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${col.color}18`, color: col.color }}>
                {items.length}
              </span>
            </div>
            <div className="p-3 space-y-3">
              {items.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground text-center py-6">Aucune intervention</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="bg-background rounded-xl p-4 border border-border hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold" style={{ color: col.color }}>{item.id}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.sector}</span>
                    </div>
                    <p className="text-sm font-mono mb-2">{item.notes}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                          {item.agentName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{item.agentName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatDate(item.assignedAt, { day: '2-digit', month: 'short', year: undefined })}
                      </span>
                    </div>
                    {item.timeline.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] font-mono text-muted-foreground">
                          Dernière action : {item.timeline[item.timeline.length - 1].action.slice(0, 50)}...
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
