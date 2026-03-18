'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Building2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SidebarNav } from '@/components/layouts/sidebar-nav';
import { MobileDrawer } from '@/components/layouts/mobile-drawer';
import { HeaderBar } from '@/components/layouts/header-bar';
import { useTheme } from '@/lib/use-theme';
import { SUPERVISEUR_NAV } from '@/lib/constants';
import { PME_PROFILE } from '@/lib/data/superviseur-data';

const TABS = SUPERVISEUR_NAV.map((n) => ({ ...n, exact: n.href === '/superviseur' }));

function findLabel(pathname: string) {
  const found = TABS.find((t) => (t.exact ? pathname === t.href : pathname.startsWith(t.href)));
  return found?.label ?? 'Dashboard';
}

export default function SuperviseurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dark, toggle, setDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pageLabel = findLabel(pathname);

  return (
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
          userInfo={{ name: 'Amadou Diallo', initials: 'AD', subtitle: PME_PROFILE.name }}
          roleLabel="Espace Superviseur"
          roleIcon="Building2"
          layoutId="supActiveTab"
          collapsed={collapsed}
          darkMode={dark}
          setDarkMode={setDark}
        />
      </motion.aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <HeaderBar
          roleIcon={<Building2 className="w-3 h-3 text-primary" />}
          roleLabel="Superviseur"
          pageLabel={pageLabel}

          darkMode={dark}
          onToggleDarkMode={toggle}
          onMobileMenuOpen={() => setMobileOpen(true)}
          notifications={3}
          rightSlot={
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          }
        />

        {/* Scope banner */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/15 text-xs font-mono overflow-hidden">
          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-primary font-semibold whitespace-nowrap">Périmètre :</span>
          <span className="text-foreground/70 font-semibold truncate">{PME_PROFILE.name}</span>
          <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">—</span>
          <span className="text-muted-foreground truncate hidden sm:inline">Secteurs : {PME_PROFILE.secteurs.join(', ')}</span>
        </div>

        <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-7 topo-pattern">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarNav
          items={TABS}
          userInfo={{ name: 'Amadou Diallo', initials: 'AD', subtitle: PME_PROFILE.name }}
          roleLabel="Espace Superviseur"
          roleIcon="Building2"
          layoutId="supActiveTabMobile"
          onNavigate={() => setMobileOpen(false)}
          darkMode={dark}
          setDarkMode={setDark}
        />
      </MobileDrawer>
    </div>
  );
}
