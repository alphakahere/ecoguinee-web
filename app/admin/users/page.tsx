'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { UserModal } from '@/components/shared/user-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { users as initialUsers } from '@/lib/data/mock-data';
import { formatDate } from '@/lib/utils';
import type { User } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', supervisor: 'Superviseur', agent: 'Agent', public: 'Public' };
const ROLE_COLORS: Record<string, string> = { admin: 'bg-[#D94035]/10 text-[#D94035]', supervisor: 'bg-[#E8A020]/10 text-[#E8A020]', agent: 'bg-[#2D7D46]/10 text-[#2D7D46]', public: 'bg-muted text-muted-foreground' };
const STATUS_COLORS: Record<string, string> = { active: 'bg-[#6FCF4A]/10 text-[#6FCF4A]', inactive: 'bg-[#E8A020]/10 text-[#E8A020]', suspended: 'bg-[#D94035]/10 text-[#D94035]' };
const STATUS_LABELS: Record<string, string> = { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu' };

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const columns = [
    { key: 'name', label: 'Nom', render: (u: User) => <span className="text-sm font-semibold">{u.name}</span> },
    { key: 'email', label: 'Email', render: (u: User) => <span className="text-xs font-mono text-muted-foreground">{u.email}</span> },
    { key: 'role', label: 'Rôle', render: (u: User) => <Badge className={`${ROLE_COLORS[u.role]} border-0`}>{ROLE_LABELS[u.role]}</Badge> },
    { key: 'territoire', label: 'Territoire', render: (u: User) => <span className="text-sm font-mono">{u.territoire ?? '—'}</span> },
    { key: 'status', label: 'Statut', render: (u: User) => <Badge className={`${STATUS_COLORS[u.status]} border-0`}>{STATUS_LABELS[u.status]}</Badge> },
    { key: 'createdAt', label: 'Créé le', render: (u: User) => <span className="text-xs font-mono text-muted-foreground">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions', label: '', render: (u: User) => (
        <button onClick={() => { setEditUser(u); setModalOpen(true); }} className="text-xs font-mono text-primary hover:underline">
          Modifier
        </button>
      ),
    },
  ];

  const filters = [
    { key: 'role', label: 'Rôle', options: [{ value: 'admin', label: 'Admin' }, { value: 'supervisor', label: 'Superviseur' }, { value: 'agent', label: 'Agent' }, { value: 'public', label: 'Public' }] },
    { key: 'status', label: 'Statut', options: [{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }, { value: 'suspended', label: 'Suspendu' }] },
  ];

  const handleSave = (data: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }) => {
    if (data.id) {
      setUsersList((prev) => prev.map((u) => u.id === data.id ? { ...u, ...data } as User : u));
    } else {
      const newUser: User = { ...data, id: `usr-${Date.now()}`, createdAt: new Date().toISOString(), status: data.status } as User;
      setUsersList((prev) => [...prev, newUser]);
    }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Utilisateurs"
        description={`${usersList.length} utilisateurs enregistrés`}
        action={
          <Button onClick={() => { setEditUser(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nouvel utilisateur
          </Button>
        }
      />
      <DataTable
        data={usersList}
        columns={columns}
        filters={filters}
        searchPlaceholder="Rechercher un utilisateur..."
        getSearchValue={(u) => `${u.name} ${u.email} ${u.phone} ${u.territoire ?? ''}`}
      />
      <UserModal
        open={modalOpen}
        user={editUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
