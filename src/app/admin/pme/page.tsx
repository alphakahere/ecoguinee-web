'use client';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { pmeList } from '@/lib/data/mock-data';
import { Badge } from '@/components/ui/badge';
import type { PME } from '@/lib/types';

const columns = [
  { key: 'name', label: 'Nom', render: (p: PME) => <span className="text-sm font-semibold">{p.name}</span> },
  { key: 'contact', label: 'Contact', render: (p: PME) => <span className="text-xs font-mono text-muted-foreground">{p.contact}</span> },
  {
    key: 'activeInterventions', label: 'Actives', render: (p: PME) => (
      <Badge className={`border-0 ${p.activeInterventions > 0 ? 'bg-[#E8A020]/10 text-[#E8A020]' : 'bg-muted text-muted-foreground'}`}>
        {p.activeInterventions}
      </Badge>
    ),
  },
  {
    key: 'completedInterventions', label: 'Terminées', render: (p: PME) => (
      <span className="text-sm font-mono font-bold text-[#6FCF4A]">{p.completedInterventions}</span>
    ),
  },
  {
    key: 'sectors', label: 'Secteurs', render: (p: PME) => (
      <div className="flex flex-wrap gap-1">
        {p.sectors.map((s) => (
          <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>
        ))}
      </div>
    ),
  },
];

export default function AdminPMEPage() {
  return (
    <div>
      <PageHeader title="PME" description={`${pmeList.length} PME enregistrées`} />
      <DataTable
        data={pmeList}
        columns={columns}
        searchPlaceholder="Rechercher une PME..."
        getSearchValue={(p) => `${p.name} ${p.contact} ${p.sectors.join(' ')}`}
      />
    </div>
  );
}
