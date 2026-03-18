'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Bell, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarNav } from '@/components/layouts/sidebar-nav';
import { MobileBottomTabs } from '@/components/layouts/mobile-bottom-tabs';
import { useTheme } from '@/lib/use-theme';
import { AGENT_NAV } from '@/lib/constants';

const TABS = AGENT_NAV.map((n) => ({ ...n, exact: n.href === '/agent' }));

function findLabel(pathname: string) {
  const found = TABS.find((t) => (t.exact ? pathname === t.href : pathname.startsWith(t.href)));
  return found?.label ?? 'Tableau de bord';
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dark, setDark } = useTheme();
  const pageLabel = findLabel(pathname);
  const isRoot = pathname === '/agent';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col h-full">
        <SidebarNav
          items={TABS}
          userInfo={{ name: 'Fatoumata Camara', initials: 'FC', subtitle: 'Agent · Dixinn' }}
          roleLabel="Espace Agent"
          roleIcon="Activity"
          layoutId="agentActiveTabDesktop"
          darkMode={dark}
          setDarkMode={setDark}
        />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">{pageLabel}</span>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-0.5">
              <Activity className="w-3 h-3 text-primary" />
              <span>Agent</span>
              {!isRoot && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground">{pageLabel}</span>
                </>
              )}
            </div>
            <h1 className="font-bold text-lg leading-none">{pageLabel}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">2</span>
            </button>
            <Link href="/agent/profil" className="lg:hidden">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">FC</div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-7 pb-24 lg:pb-7 topo-pattern">
          {children}
        </main>
      </div>

      {/* Mobile FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        className="fixed bottom-[76px] right-4 z-40 lg:hidden w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center shadow-[0_4px_20px_rgba(45,125,70,0.4)]"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Mobile bottom tabs */}
      <MobileBottomTabs tabs={TABS} layoutId="agentMobileTab" />
    </div>
  );
}
