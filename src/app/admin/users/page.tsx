'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { UserModal } from '@/components/shared/user-modal';
import type { UserSaveFullPayload } from '@/components/shared/user-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { ROLE_META } from '@/lib/types';
import type { User, UserRole } from '@/lib/types';
import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/hooks/queries/useUsers';
import { useCreateUser } from '@/hooks/mutations/useCreateUser';
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser';
import { useUpdateUserStatus } from '@/hooks/mutations/useUpdateUserStatus';
import { useDeleteUser } from '@/hooks/mutations/useDeleteUser';

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

/** Comptes staff — exclus de cette liste (gérés ailleurs) */
const EXCLUDED_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers({ page: 1, limit: 200 });
  const usersList = useMemo(
    () => (data?.data ?? []).filter((u) => !EXCLUDED_ROLES.includes(u.role)),
    [data?.data],
  );

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';

  const modalVariant = useMemo((): 'full' | 'statusOnly' => {
    if (!editUser) return 'full';
    if (isSuperAdmin) return 'full';
    if (isAdmin && editUser.role === 'ADMIN') return 'full';
    return 'statusOnly';
  }, [editUser, isSuperAdmin, isAdmin]);

  /** Admin can only create/manage ADMIN accounts; Super Admin has full role control */
  const roleLockedToAdmin = Boolean(isAdmin && (!editUser || editUser.role === 'ADMIN'));

  const canDelete = Boolean(editUser && editUser.id !== currentUser?.id);

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
    setEditUser(u);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleSaveFull = async (payload: UserSaveFullPayload) => {
    try {
      if (payload.id) {
        await updateUser.mutateAsync({
          id: payload.id,
          payload: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            territoire: payload.territoire,
            status: payload.status,
          },
        });
        toast.success('Utilisateur mis à jour');
      } else {
        await createUser.mutateAsync({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
          territoire: payload.territoire,
          status: payload.status ?? 'ACTIVE',
          password: payload.password,
        });
        toast.success('Utilisateur créé');
      }
      closeModal();
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleSaveStatus = async (id: string, status: User['status']) => {
    try {
      await updateUserStatus.mutateAsync({ id, status });
      toast.success('Statut mis à jour');
      closeModal();
    } catch {
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success('Utilisateur supprimé');
      closeModal();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const columns = [
    { key: 'name', label: 'Nom', render: (u: User) => <span className="text-sm font-semibold">{u.name}</span> },
    {
      key: 'email',
      label: 'Email',
      render: (u: User) => <span className="text-xs font-mono text-muted-foreground">{u.email ?? '—'}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (u: User) => {
        const m = ROLE_META[u.role];
        return (
          <Badge className={`${m.bg} ${m.color} border-0`}>{m.label}</Badge>
        );
      },
    },
    {
      key: 'territoire',
      label: 'Territoire',
      render: (u: User) => <span className="text-sm font-mono">{u.territoire ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (u: User) => (
        <Badge className={`${STATUS_COLORS[u.status]} border-0`}>{STATUS_LABELS[u.status]}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (u: User) => (
        <span className="text-xs font-mono text-muted-foreground">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (u: User) => (
        <button
          type="button"
          onClick={() => openEdit(u)}
          className="text-xs font-mono text-primary hover:underline"
        >
          {isAdmin && u.role !== 'ADMIN' ? 'Statut / supprimer' : 'Modifier'}
        </button>
      ),
    },
  ];

  const filters = [
    {
      key: 'role',
      label: 'Rôle',
      options: (Object.entries(ROLE_META) as [UserRole, (typeof ROLE_META)[UserRole]][])
        .filter(([value]) => !EXCLUDED_ROLES.includes(value))
        .map(([value, m]) => ({ value, label: m.label })),
    },
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'INACTIVE', label: 'Inactif' },
        { value: 'SUSPENDED', label: 'Suspendu' },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description={
          isLoading
            ? 'Chargement…'
            : isError
              ? 'Erreur de chargement'
              : `${usersList.length} utilisateurs enregistrés`
        }
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nouvel utilisateur
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">
          Impossible de charger les utilisateurs. Vérifiez la connexion API.
        </p>
      ) : (
            <DataTable
              data={usersList}
              columns={columns}
              filters={filters}
              searchPlaceholder="Rechercher un utilisateur..."
              getSearchValue={(u) => `${u.name} ${u.email ?? ''} ${u.phone} ${u.territoire ?? ''}`}
            />
      )}
      <UserModal
        open={modalOpen}
        user={editUser}
        variant={modalVariant}
        roleLockedToAdmin={roleLockedToAdmin}
        onClose={closeModal}
        onSaveFull={modalVariant === 'full' ? handleSaveFull : undefined}
        onSaveStatus={modalVariant === 'statusOnly' ? handleSaveStatus : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        canDelete={canDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
