'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type Column } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useSMEs } from '@/hooks/queries/useSMEs';
import { useZones } from '@/hooks/queries/useZones';
import { useCreateSME } from '@/hooks/mutations/useCreateSME';
import { useUpdateSME } from '@/hooks/mutations/useUpdateSME';
import { useDeleteSME } from '@/hooks/mutations/useDeleteSME';
import { SMEModal } from '@/components/admin/sme-modal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ApiSME, CreateSMEPayload, UpdateSMEPayload } from '@/types/api';

export default function AdminPMEPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      active: activeFilter === '' ? undefined : activeFilter === 'true',
      page,
      limit: pageSize,
    }),
    [debouncedSearch, activeFilter, page],
  );

  const { data, isLoading, isError } = useSMEs(filters);
  const smeList = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

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
        toast.success('Organisation mise à jour');
      } else {
        await createSME.mutateAsync(payload as CreateSMEPayload);
        toast.success('Organisation créée');
      }
      close();
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (s: ApiSME) => {
    if (!window.confirm(`Supprimer l'organisation « ${s.name} » ?`)) return;
    try {
      await deleteSME.mutateAsync(s.id);
      toast.success('Organisation supprimée');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const handleToggleActive = async (s: ApiSME) => {
    try {
      await updateSME.mutateAsync({ id: s.id, payload: { active: !s.active } });
      toast.success(s.active ? 'Organisation désactivée' : 'Organisation réactivée');
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const columns: Column<ApiSME>[] = [
    {
      key: 'name',
      label: 'Nom',
      render: (s) => <span className="text-sm font-semibold">{s.name}</span>,
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (s) => (
        <span className="text-xs font-mono text-muted-foreground">{s.phone ?? '—'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (s) => (
        <span className="text-xs font-mono text-muted-foreground">{s.email ?? '—'}</span>
      ),
    },
    {
      key: 'activityType',
      label: 'Activité',
      render: (s) => (
        <span className="text-xs font-mono">{s.activityType ?? '—'}</span>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      render: (s) => (
        <Badge className={`border-0 ${s.active ? 'bg-[#6FCF4A]/10 text-[#6FCF4A]' : 'bg-muted text-muted-foreground'}`}>
          {s.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'zones',
      label: 'Zones',
      render: (s) => (
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
      headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Modifier"
            onClick={() => openEdit(s)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={s.active ? 'Désactiver' : 'Activer'}
            disabled={isMutating}
            onClick={() => handleToggleActive(s)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {s.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="Supprimer"
            disabled={isMutating}
            onClick={() => handleDelete(s)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Gestion des organisations</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} organisation enregistrée{total !== 1 ? 's' : ''}</p>
        </div>
        <Button type="button" onClick={openCreate} className="font-mono text-xs">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle organisation
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Nom, email, téléphone…"
          className="w-full max-w-md"
        />
        <Select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="min-w-[160px] max-w-xs"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataTable
        data={smeList}
        columns={columns}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        canPrev={canPrev}
        canNext={canNext}
        toolbar={toolbar}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(s) => s.id}
      />
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
