'use client';

import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';

const COLUMNS: { status: ApiInterventionStatus; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { status: 'ASSIGNED',    label: 'Assignées',  icon: AlertTriangle, color: '#3B82F6' },
  { status: 'IN_PROGRESS', label: 'En cours',   icon: Clock,         color: '#E8A020' },
  { status: 'RESOLVED',    label: 'Résolues',   icon: CheckCircle,   color: '#6FCF4A' },
  { status: 'FAILED',      label: 'Échouées',   icon: XCircle,       color: '#D94035' },
];

export function InterventionsBoard() {
  const { data: overview } = useSupervisorOverview();
  const smeId = overview?.pme.id;

  const { data, isLoading } = useInterventions(smeId ? { smeId, limit: 100 } : undefined);
  const interventions: ApiIntervention[] = data?.data ?? (Array.isArray(data) ? data as ApiIntervention[] : []);

  if (isLoading || !smeId) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = interventions.filter((i) => i.status === col.status);
        return (
          <div key={col.status} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <col.icon className="w-4 h-4" style={{ color: col.color }} />
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${col.color}18`, color: col.color }}>
                {items.length}
              </span>
            </div>
            <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground text-center py-6">Aucune intervention</p>
              ) : items.map((item) => (
                <div key={item.id} className="bg-background rounded-xl p-4 border border-border hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold" style={{ color: col.color }}>{item.id.slice(0, 8)}</span>
                  </div>
                  {item.notes && <p className="text-sm font-mono mb-2 line-clamp-2">{item.notes}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {item.agent?.name?.split(' ').map((n) => n[0]).join('') ?? '?'}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.agent?.name ?? '—'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {item.assignedDate ? formatDate(item.assignedDate) : formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
