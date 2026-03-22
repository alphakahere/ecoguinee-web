'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
        <motion.aside
          animate={{ width: collapsed ? 56 : 224 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden md:flex flex-col shrink-0 h-full overflow-hidden"
          style={{ width: collapsed ? 56 : 224 }}
        >
          <SidebarNav
            items={TABS}
            userInfo={sidebarUserInfo}
            roleLabel="Admin Panel"
            roleIcon="ShieldCheck"
            layoutId="adminActiveTab"
            collapsed={collapsed}
          />
        </motion.aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <HeaderBar
            roleIcon={<ShieldCheck className="w-3 h-3 text-primary" />}
            roleLabel="Admin"
            pageLabel={pageLabel}
            onMobileMenuOpen={() => setMobileOpen(true)}
            notifications={3}
            leftSlot={
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
              </button>
            }
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
