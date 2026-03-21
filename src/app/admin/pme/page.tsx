'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSMEs } from '@/hooks/queries/useSMEs';
import { useZones } from '@/hooks/queries/useZones';
import { useCreateSME } from '@/hooks/mutations/useCreateSME';
import { useUpdateSME } from '@/hooks/mutations/useUpdateSME';
import { useDeleteSME } from '@/hooks/mutations/useDeleteSME';
import { SMEModal } from '@/components/admin/sme-modal';
import type { ApiSME, CreateSMEPayload, UpdateSMEPayload } from '@/types/api';

export default function AdminPMEPage() {
  const { data, isLoading, isError } = useSMEs();
  const smeList = data?.data ?? [];
  const { data: zonesData } = useZones();
  const zonesList = zonesData?.data ?? [];

  const createSME = useCreateSME();
  const updateSME = useUpdateSME();
  const deleteSME = useDeleteSME();

  const [modalOpen, setModalOpen] = useState(false);
  const [editSME, setEditSME] = useState<ApiSME | null>(null);

  const openCreate = () => { setEditSME(null); setModalOpen(true); };
  const openEdit = (s: ApiSME) => { setEditSME(s); setModalOpen(true); };
  const close = () => { setModalOpen(false); setEditSME(null); };

  const isMutating = createSME.isPending || updateSME.isPending || deleteSME.isPending;

  const handleSave = async (payload: CreateSMEPayload | UpdateSMEPayload, id?: string) => {
    try {
      if (id) {
        await updateSME.mutateAsync({ id, payload });
        toast.success('PME mise à jour');
      } else {
        await createSME.mutateAsync(payload as CreateSMEPayload);
        toast.success('PME créée');
      }
      close();
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (s: ApiSME) => {
    if (!window.confirm(`Supprimer la PME « ${s.name} » ?`)) return;
    try {
      await deleteSME.mutateAsync(s.id);
      toast.success('PME supprimée');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      render: (s: ApiSME) => <span className="text-sm font-semibold">{s.name}</span>,
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (s: ApiSME) => (
        <span className="text-xs font-mono text-muted-foreground">{s.phone ?? '—'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (s: ApiSME) => (
        <span className="text-xs font-mono text-muted-foreground">{s.email ?? '—'}</span>
      ),
    },
    {
      key: 'activityType',
      label: 'Activité',
      render: (s: ApiSME) => (
        <span className="text-xs font-mono">{s.activityType ?? '—'}</span>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      render: (s: ApiSME) => (
        <Badge className={`border-0 ${s.active ? 'bg-[#6FCF4A]/10 text-[#6FCF4A]' : 'bg-muted text-muted-foreground'}`}>
          {s.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'zones',
      label: 'Zones',
      render: (s: ApiSME) => (
        <div className="flex flex-wrap gap-1">
          {(s.zones ?? []).slice(0, 3).map((z) => (
            <span key={z.id} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {z.name}
            </span>
          ))}
          {(s.zones ?? []).length > 3 && (
            <span className="text-[10px] font-mono text-muted-foreground">
              +{(s.zones ?? []).length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (s: ApiSME) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openEdit(s)}
            className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button
            type="button"
            onClick={() => handleDelete(s)}
            disabled={isMutating}
            className="text-xs font-mono text-[#D94035] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="PME"
        description={
          isLoading ? 'Chargement…' : isError ? 'Erreur' : `${smeList.length} PME enregistrées`
        }
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle PME
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">
          Impossible de charger les PME.
        </p>
      ) : (
        <DataTable
          data={smeList}
          columns={columns}
          searchPlaceholder="Rechercher une PME..."
          getSearchValue={(s) =>
            `${s.name} ${s.email ?? ''} ${s.phone ?? ''} ${s.activityType ?? ''} ${(s.zones ?? []).map((z) => z.name).join(' ')}`
          }
        />
      )}
      <SMEModal
        open={modalOpen}
        sme={editSME}
        zones={zonesList}
        onClose={close}
        onSave={handleSave}
        isSubmitting={isMutating}
      />
    </div>
  );
}
