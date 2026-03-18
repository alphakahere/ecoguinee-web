'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw, Wrench, CheckCircle, AlertTriangle, Flag } from 'lucide-react';
import { hotspots } from '@/lib/data/mock-data';
import { StatusBadge } from '@/components/shared/status-badge';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { WasteTypeBadge } from '@/components/shared/waste-type-badge';
import { formatDate } from '@/lib/utils';

const MY_REPORTS = hotspots.filter((h) => h.location.territoire === 'Dixinn');
const MY_ASSIGNED = hotspots.filter((h) => h.assignedTo !== undefined).slice(0, 5);

const RECENT_ACTIVITY = [
  { id: 1, icon: RefreshCw, text: 'Signalement mis à jour — Hamdallaye', time: 'Il y a 23 min' },
  { id: 2, icon: Wrench, text: 'Intervention assignée — Zone Commerciale', time: 'Il y a 2h' },
  { id: 3, icon: CheckCircle, text: 'Signalement résolu', time: 'Hier' },
  { id: 4, icon: AlertTriangle, text: 'Alerte critique — Zone Commerciale', time: 'Il y a 2j' },
  { id: 5, icon: Flag, text: 'Nouveau commentaire reçu', time: 'Il y a 3j' },
];

export function RecentReports() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Reports table */}
      <div className="lg:col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Mes derniers signalements</h3>
          <Link href="/agent/signalements" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
            Voir tous <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                {['ID', 'Type', 'Gravité', 'Secteur', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_REPORTS.slice(0, 5).map((hs) => (
                <tr key={hs.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{hs.id}</td>
                  <td className="px-4 py-3"><WasteTypeBadge type={hs.wasteType} /></td>
                  <td className="px-4 py-3"><SeverityBadge severity={hs.severity} /></td>
                  <td className="px-4 py-3 text-xs font-mono truncate max-w-[120px]">{hs.location.sector}</td>
                  <td className="px-4 py-3"><StatusBadge status={hs.status} /></td>
                  <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">{formatDate(hs.reportedAt, { day: '2-digit', month: 'short', year: undefined })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity feed */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Interventions assignées</h3>
            <Link href="/agent/interventions" className="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
              Voir toutes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {MY_ASSIGNED.slice(0, 4).map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{h.location.sector}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{h.id}</p>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Activité récente</h3>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate">{a.text}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
