'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { SidebarNav } from '@/components/layouts/sidebar-nav';
import { MobileDrawer } from '@/components/layouts/mobile-drawer';
import { HeaderBar } from '@/components/layouts/header-bar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { ADMIN_NAV } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

const TABS = ADMIN_NAV.map((n) => ({ ...n, exact: n.href === '/admin' }));

function findLabel(pathname: string) {
  const found = TABS.find((t) => (t.exact ? pathname === t.href : pathname.startsWith(t.href)));
  return found?.label ?? 'Administration';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  SUPERVISOR: 'Superviseur',
  AGENT: 'Agent',
  USER: 'Utilisateur',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const pageLabel = findLabel(pathname);

  const userName = currentUser?.name ?? 'Administrateur';
  const userInitials = initials(userName);
  const userSubtitle = currentUser?.email ?? currentUser?.phone ?? '';
  const roleBadge = ROLE_LABELS[currentUser?.role ?? ''] ?? currentUser?.role ?? 'Admin';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const profile = {
    name: userName,
    initials: userInitials,
    subtitle: userSubtitle,
    roleBadge,
    profileHref: '/admin/profil',
    settingsHref: '/admin/parametres',
  };

  const sidebarUserInfo = { name: userName, initials: userInitials, subtitle: roleBadge };

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col h-full">
          <SidebarNav
            items={TABS}
            userInfo={sidebarUserInfo}
            roleLabel="Admin Panel"
            roleIcon="ShieldCheck"
            layoutId="adminActiveTab"
          />
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <HeaderBar
            roleIcon={<ShieldCheck className="w-3 h-3 text-primary" />}
            roleLabel="Admin"
            pageLabel={pageLabel}
            onMobileMenuOpen={() => setMobileOpen(true)}
            notifications={3}
            profile={profile}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 topo-pattern">
            {children}
          </main>
        </div>

        {/* Mobile drawer */}
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <SidebarNav
            items={TABS}
            userInfo={sidebarUserInfo}
            roleLabel="Admin Panel"
            roleIcon="ShieldCheck"
            layoutId="adminActiveTabMobile"
            onNavigate={() => setMobileOpen(false)}
          />
        </MobileDrawer>
      </div>
    </AuthGuard>
  );
}
