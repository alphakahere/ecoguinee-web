'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserModal } from '@/components/shared/user-modal';
import type { UserSaveFullPayload } from '@/components/shared/user-modal';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  formatDateShort,
  initials,
  matchesRoleTab,
  type RoleTab,
} from '@/lib/user-utils';
import { ROLE_META } from '@/lib/types';
import type { User } from '@/lib/types';
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

function exportUsersCsv(users: User[]) {
  const headers = ['id', 'nom', 'email', 'telephone', 'role', 'territoire', 'statut', 'cree_le', 'derniere_connexion'];
  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email ?? '',
    u.phone,
    u.role,
    u.territoire ?? '',
    u.status,
    u.createdAt,
    u.lastLogin ?? '',
  ]);
  const escape = (c: string) => `"${String(c).replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'utilisateurs-ecoguinee.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers({ page: 1, limit: 200 });
  const usersList = useMemo(() => data?.data ?? [], [data]);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<RoleTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';

  const modalVariant = useMemo((): 'full' | 'statusOnly' => {
    if (!editUser) return 'full';
    if (isSuperAdmin) return 'full';
    if (isAdmin && editUser.role === 'ADMIN') return 'full';
    return 'statusOnly';
  }, [editUser, isSuperAdmin, isAdmin]);

  const roleLockedToAdmin = Boolean(isAdmin && (!editUser || editUser.role === 'ADMIN'));
  const canDelete = Boolean(editUser && editUser.id !== currentUser?.id);

  const isSubmitting =
    createUser.isPending ||
    updateUser.isPending ||
    updateUserStatus.isPending ||
    deleteUser.isPending;

  const filtered = useMemo(() => {
    let result = usersList;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        `${u.name} ${u.email ?? ''} ${u.phone} ${u.territoire ?? ''} ${u.id}`.toLowerCase().includes(q),
      );
    }
    result = result.filter((u) => matchesRoleTab(u, roleTab));
    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [usersList, search, roleTab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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

  const handleDeleteRow = async (u: User) => {
    if (u.id === currentUser?.id) return;
    if (!window.confirm(`Supprimer ${u.name} ?`)) return;
    try {
      await deleteUser.mutateAsync(u.id);
      toast.success('Utilisateur supprimé');
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
      toast.success(
        u.status === 'ACTIVE' ? 'Compte désactivé' : 'Compte réactivé',
      );
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const onExportCsv = useCallback(() => {
    exportUsersCsv(filtered);
  }, [filtered]);

  const roleTabs: { id: RoleTab; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'admin', label: 'Administrateur' },
    { id: 'superviseur', label: 'Superviseur' },
    { id: 'agent', label: 'Agent' },
    { id: 'public', label: 'Public' },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {/* Title + actions */}
        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Gestion des Utilisateurs</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} / {usersList.length} utilisateurs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onExportCsv} className="font-mono text-xs">
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
            <Button type="button" onClick={openCreate} className="font-mono text-xs">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Nom, email, territoire…"
            className="w-full max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {roleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setRoleTab(t.id);
                  setPage(0);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-mono transition-colors',
                  roleTab === t.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border bg-background text-muted-foreground hover:bg-muted/60',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="lg:ml-auto">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
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

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          </div>
        ) : isError ? (
            <p className="py-8 text-sm font-mono text-muted-foreground">
              Impossible de charger les utilisateurs.
            </p>
          ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-background">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Utilisateur
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rôle
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Territoire
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Statut
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inscription
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dernière conn.
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        Aucun résultat
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((u) => {
                      const m = ROLE_META[u.role];
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {initials(u.name)}
                              </span>
                              <div>
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="font-mono text-[11px] text-muted-foreground">{u.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-xs text-muted-foreground">{u.email ?? '—'}</span>
                              <span className="font-mono text-xs">{u.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${m.bg} ${m.color}`}
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.dot }} />
                              {m.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {u.territoire ? (
                              <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs">
                                {u.territoire}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[u.status]}`}
                            >
                              {STATUS_LABELS[u.status]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatDateShort(u.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">
                              {u.lastLogin ? formatDateShort(u.lastLogin) : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
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
                                {u.status === 'ACTIVE' ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
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
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
