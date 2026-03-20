'use client';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { territoires } from '@/lib/data/mock-data';
import type { Territoire } from '@/lib/types';

const columns = [
  { key: 'name', label: 'Territoire', render: (t: Territoire) => <span className="text-sm font-semibold">{t.name}</span> },
  { key: 'hotspotCount', label: 'Points noirs', render: (t: Territoire) => <span className="text-sm font-mono font-bold text-[#E8A020]">{t.hotspotCount}</span> },
  { key: 'resolvedCount', label: 'Résolus', render: (t: Territoire) => <span className="text-sm font-mono font-bold text-[#6FCF4A]">{t.resolvedCount}</span> },
  {
    key: 'rate', label: 'Taux', render: (t: Territoire) => {
      const rate = Math.round((t.resolvedCount / Math.max(t.hotspotCount, 1)) * 100);
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rate >= 70 ? '#6FCF4A' : rate >= 50 ? '#E8A020' : '#D94035' }} />
          </div>
          <span className="text-xs font-mono">{rate}%</span>
        </div>
      );
    },
  },
  { key: 'sectors', label: 'Secteurs', render: (t: Territoire) => <span className="text-xs font-mono text-muted-foreground">{t.sectors.length} secteurs</span> },
  {
    key: 'coordinates', label: 'Coordonnées', render: (t: Territoire) => (
      <span className="text-[10px] font-mono text-muted-foreground">
        {t.coordinates[0].toFixed(4)}, {t.coordinates[1].toFixed(4)}
      </span>
    ),
  },
];

export default function AdminTerritoiresPage() {
  return (
    <div>
      <PageHeader title="Territoires" description={`${territoires.length} territoires enregistrés`} />
      <DataTable
        data={territoires}
        columns={columns}
        searchPlaceholder="Rechercher un territoire..."
        getSearchValue={(t) => `${t.name} ${t.sectors.map((s) => s.name).join(' ')}`}
      />
    </div>
  );
}
