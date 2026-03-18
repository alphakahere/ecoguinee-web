'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { SidebarNav } from '@/components/layouts/sidebar-nav';
import { MobileDrawer } from '@/components/layouts/mobile-drawer';
import { HeaderBar } from '@/components/layouts/header-bar';
import { useTheme } from '@/lib/use-theme';
import { ADMIN_NAV } from '@/lib/constants';

const TABS = ADMIN_NAV.map((n) => ({ ...n, exact: n.href === '/admin' }));

function findLabel(pathname: string) {
  const found = TABS.find((t) => (t.exact ? pathname === t.href : pathname.startsWith(t.href)));
  return found?.label ?? 'Administration';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dark, toggle, setDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const pageLabel = findLabel(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-full">
        <SidebarNav
          items={TABS}
          userInfo={{ name: 'Amadou Kouyaté', initials: 'AK', subtitle: 'Administrateur' }}
          roleLabel="Admin Panel"
          roleIcon="ShieldCheck"
          layoutId="adminActiveTab"
          darkMode={dark}
          setDarkMode={setDark}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <HeaderBar
          roleIcon={<ShieldCheck className="w-3 h-3 text-primary" />}
          roleLabel="Admin"
          pageLabel={pageLabel}

          darkMode={dark}
          onToggleDarkMode={toggle}
          onMobileMenuOpen={() => setMobileOpen(true)}
          notifications={3}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 topo-pattern">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarNav
          items={TABS}
          userInfo={{ name: 'Amadou Kouyaté', initials: 'AK', subtitle: 'Administrateur' }}
          roleLabel="Admin Panel"
          roleIcon="ShieldCheck"
          layoutId="adminActiveTabMobile"
          onNavigate={() => setMobileOpen(false)}
          darkMode={dark}
          setDarkMode={setDark}
        />
      </MobileDrawer>
    </div>
  );
}
