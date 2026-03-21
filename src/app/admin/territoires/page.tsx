'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useZones } from '@/hooks/queries/useZones';
import { useCreateZone } from '@/hooks/mutations/useCreateZone';
import { useUpdateZone } from '@/hooks/mutations/useUpdateZone';
import { useDeleteZone } from '@/hooks/mutations/useDeleteZone';
import { ZoneModal } from '@/components/admin/zone-modal';
import type { ApiZone, CreateZonePayload, UpdateZonePayload } from '@/types/api';
import { ZONE_TYPE_META } from '@/types/api';

export default function AdminTerritoiresPage() {
  const { data, isLoading, isError } = useZones();
  const zonesList = data?.data ?? [];

  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const [modalOpen, setModalOpen] = useState(false);
  const [editZone, setEditZone] = useState<ApiZone | null>(null);

  const openCreate = () => { setEditZone(null); setModalOpen(true); };
  const openEdit = (z: ApiZone) => { setEditZone(z); setModalOpen(true); };
  const close = () => { setModalOpen(false); setEditZone(null); };

  const isMutating = createZone.isPending || updateZone.isPending || deleteZone.isPending;

  const handleSave = async (payload: CreateZonePayload | UpdateZonePayload, id?: string) => {
    try {
      if (id) {
        await updateZone.mutateAsync({ id, payload });
        toast.success('Zone mise à jour');
      } else {
        await createZone.mutateAsync(payload as CreateZonePayload);
        toast.success('Zone créée');
      }
      close();
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (z: ApiZone) => {
    if (!window.confirm(`Supprimer la zone « ${z.name} » ?`)) return;
    try {
      await deleteZone.mutateAsync(z.id);
      toast.success('Zone supprimée');
    } catch {
      toast.error('Suppression impossible (la zone a peut-être des enfants)');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      render: (z: ApiZone) => <span className="text-sm font-semibold">{z.name}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (z: ApiZone) => (
        <Badge className="bg-primary/10 text-primary border-0">
          {ZONE_TYPE_META[z.type].label}
        </Badge>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
      render: (z: ApiZone) => (
        <span className="text-xs font-mono text-muted-foreground">
          {z.parent?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (z: ApiZone) => (
        <span className="text-xs font-mono text-muted-foreground">{formatDate(z.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (z: ApiZone) => (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => openEdit(z)} className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
          <button type="button" onClick={() => handleDelete(z)} disabled={isMutating} className="text-xs font-mono text-[#D94035] hover:underline inline-flex items-center gap-1 disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'type',
      label: 'Type',
      options: Object.entries(ZONE_TYPE_META).map(([v, m]) => ({ value: v, label: m.label })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Territoires"
        description={
          isLoading ? 'Chargement…' : isError ? 'Erreur' : `${zonesList.length} zones enregistrées`
        }
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle zone
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">
          Impossible de charger les zones.
        </p>
      ) : (
        <DataTable
          data={zonesList}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher une zone..."
          getSearchValue={(z) => `${z.name} ${ZONE_TYPE_META[z.type].label} ${z.parent?.name ?? ''}`}
        />
      )}
      <ZoneModal
        open={modalOpen}
        zone={editZone}
        allZones={zonesList}
        onClose={close}
        onSave={handleSave}
        isSubmitting={isMutating}
      />
    </div>
  );
}
