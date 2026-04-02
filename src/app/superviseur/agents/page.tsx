'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserModal } from '@/components/shared/user-modal';
import type { UserSaveFullPayload } from '@/components/shared/user-modal';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { formatDateShort, initials } from '@/lib/user-utils';
import { ROLE_META } from '@/lib/types';
import type { User } from '@/lib/types';
import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/hooks/queries/useUsers';
import { usersService } from '@/services/users';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCreateUser } from '@/hooks/mutations/useCreateUser';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';
import { useUpdateUserStatus } from '@/hooks/mutations/useUpdateUserStatus';
import { useDeleteUser } from '@/hooks/mutations/useDeleteUser';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-[#6FCF4A]/10 text-[#6FCF4A]',
  INACTIVE: 'bg-[#E8A020]/10 text-[#E8A020]',
  SUSPENDED: 'bg-[#D94035]/10 text-[#D94035]',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  SUSPENDED: 'Suspendu',
};

const pageSize = 10;

export default function SuperviseurAgentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useSupervisorOverview();
  const organizationId = overview?.pme.id;
  const pmeName = overview?.pme.name ?? '';

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () =>
      organizationId
        ? {
            roleGroup: 'agent' as const,
            organizationId,
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            page,
            limit: pageSize,
          }
        : undefined,
    [organizationId, debouncedSearch, statusFilter, page],
  );

  const { data, isLoading, isError } = useUsers(filters, { enabled: !!organizationId });
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;
  const goToPage = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const isSubmitting =
    createUser.isPending ||
    updateUser.isPending ||
    updateUserStatus.isPending ||
    deleteUser.isPending;

  const openCreate = () => {
    setEditUser(null);
    setModalOpen(true);
  };
  const openEdit = (u: User) => {
    if (organizationId && u.organizationId && u.organizationId !== organizationId) {
      toast.error('Cet utilisateur n\'appartient pas à votre organisation.');
      return;
    }
    setEditUser(u);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleSaveFull = async (payload: UserSaveFullPayload) => {
    if (!organizationId) return;
    try {
      if (payload.id) {
        await updateUser.mutateAsync({
          id: payload.id,
          payload: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: 'AGENT',
            territoire: payload.territoire,
            status: payload.status,
            organizationId: payload.organizationId,
          },
        });
        toast.success('Agent mis à jour');
      } else {
        await createUser.mutateAsync({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: 'AGENT',
          territoire: payload.territoire,
          status: payload.status ?? 'ACTIVE',
          password: payload.password,
          organizationId: payload.organizationId,
        });
        toast.success('Agent créé');
      }
      closeModal();
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success('Agent supprimé');
      closeModal();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const handleDeleteRow = async (u: User) => {
    if (u.id === currentUser?.id) return;
    if (!window.confirm(`Supprimer ${u.name} ?`)) return;
    try {
      await deleteUser.mutateAsync(u.id);
      toast.success('Agent supprimé');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const handleToggleActive = async (u: User) => {
    if (u.id === currentUser?.id) return;
    try {
      await updateUserStatus.mutateAsync({
        id: u.id,
        status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      toast.success(u.status === 'ACTIVE' ? 'Compte désactivé' : 'Compte réactivé');
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const onExportCsv = useCallback(() => {
    if (!organizationId) return;
    usersService.exportCsv({
      roleGroup: 'agent',
      organizationId,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    });
  }, [organizationId, debouncedSearch, statusFilter]);

  const canDelete = Boolean(editUser && editUser.id !== currentUser?.id);

  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'Agent',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials(u.name)}
          </span>
          <div>
            <p className="text-sm font-medium">{u.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{u.id.slice(0, 8)}…</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (u) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-muted-foreground">{u.email ?? '—'}</span>
          <span className="font-mono text-xs">{u.phone}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (u) => {
        const m = ROLE_META[u.role];
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${m.bg} ${m.color}`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.dot }} />
            {m.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (u) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[u.status]}`}
        >
          {STATUS_LABELS[u.status]}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      render: (u) => (
        <span className="font-mono text-xs text-muted-foreground">{formatDateShort(u.createdAt)}</span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Dernière conn.',
      render: (u) => (
        <span className="font-mono text-xs text-muted-foreground">
          {u.lastLogin ? formatDateShort(u.lastLogin) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      headerClassName:
        'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Modifier"
            onClick={() => openEdit(u)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={u.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
            disabled={u.id === currentUser?.id}
            onClick={() => handleToggleActive(u)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {u.status === 'ACTIVE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="Supprimer"
            disabled={u.id === currentUser?.id}
            onClick={() => handleDeleteRow(u)}
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
          <h2 className="text-lg font-semibold tracking-tight">Agents de l'organisation</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total} agent{total !== 1 ? 's' : ''}
            {pmeName ? ` — ${pmeName}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onExportCsv}
            disabled={!organizationId}
            className="font-mono text-xs"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          <Button type="button" onClick={openCreate} disabled={!organizationId} className="font-mono text-xs">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel agent
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Nom, email, téléphone…"
          className="w-full max-w-md"
        />
        <div className="lg:ml-auto">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px]"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="SUSPENDED">Suspendu</option>
          </Select>
        </div>
      </div>
    </div>
  );

  if (!overviewLoading && !organizationId) {
    return (
      <div>
        <PageHeader title="Agents" description="Équipe terrain" />
        <p className="text-sm font-mono text-muted-foreground text-center py-16">
          Périmètre de l'organisation indisponible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agents"
        description={pmeName ? `Gestion de l’équipe — ${pmeName}` : 'Équipe terrain de votre périmètre'}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        canPrev={canPrev}
        canNext={canNext}
        toolbar={toolbar}
        isLoading={isLoading || overviewLoading}
        isError={isError}
        getRowKey={(u) => u.id}
      />

      <UserModal
        open={modalOpen}
        user={editUser}
        variant="full"
        roleLockedToAgent
        contextSubtitle={pmeName ? `Organisation : ${pmeName}` : undefined}
        organizationId={organizationId}
        onClose={closeModal}
        onSaveFull={handleSaveFull}
        onDelete={canDelete ? handleDelete : undefined}
        canDelete={canDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
