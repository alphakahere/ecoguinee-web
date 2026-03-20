'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CAMP_TYPE_META, CAMP_STATUS_META } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import type { Campaign } from '@/lib/types';

const columns = [
  { key: 'titre', label: 'Titre', render: (c: Campaign) => (
    <Link href={`/admin/campagnes/${c.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
      {c.titre}
    </Link>
  )},
  { key: 'type', label: 'Type', render: (c: Campaign) => {
    const tm = CAMP_TYPE_META[c.type];
    return <Badge className="border-0" style={{ background: tm.bg, color: tm.color }}>{tm.emoji} {tm.label}</Badge>;
  }},
  { key: 'commune', label: 'Commune', render: (c: Campaign) => <span className="text-sm font-mono">{c.commune}</span> },
  { key: 'secteur', label: 'Secteur', render: (c: Campaign) => <span className="text-sm font-mono">{c.secteur}</span> },
  { key: 'statut', label: 'Statut', render: (c: Campaign) => {
    const sm = CAMP_STATUS_META[c.statut];
    return <Badge className={`${sm.bg} ${sm.text} border-0`}>{sm.label}</Badge>;
  }},
  { key: 'datePrevue', label: 'Date prévue', render: (c: Campaign) => <span className="text-xs font-mono text-muted-foreground">{formatDate(c.datePrevue)}</span> },
  { key: 'agentNom', label: 'Agent', render: (c: Campaign) => <span className="text-xs font-mono">{c.agentNom}</span> },
];

const filters = [
  { key: 'statut', label: 'Statut', options: [{ value: 'planifiee', label: 'Planifiée' }, { value: 'en-cours', label: 'En cours' }, { value: 'terminee', label: 'Terminée' }, { value: 'annulee', label: 'Annulée' }] },
  { key: 'type', label: 'Type', options: [{ value: 'sensibilisation', label: 'Sensibilisation' }, { value: 'promotion', label: 'Promotion' }, { value: 'formation', label: 'Formation' }] },
];

export default function AdminCampagnesPage() {
  return (
    <div>
      <PageHeader
        title="Campagnes"
        description={`${CAMPAIGNS.length} campagnes`}
        action={
          <Link href="/admin/campagnes/nouvelle">
            <Button><Plus className="w-4 h-4 mr-2" /> Nouvelle campagne</Button>
          </Link>
        }
      />
      <DataTable
        data={CAMPAIGNS}
        columns={columns}
        filters={filters}
        searchPlaceholder="Rechercher une campagne..."
        getSearchValue={(c) => `${c.titre} ${c.commune} ${c.secteur} ${c.agentNom}`}
      />
    </div>
  );
}
