'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Flag, Wrench, User, Megaphone } from 'lucide-react';
import { isActivePath } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = { Home, Flag, Wrench, User, Megaphone };

interface Tab {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  exact?: boolean;
}

interface MobileBottomTabsProps {
  tabs: Tab[];
  layoutId: string;
}

export function MobileBottomTabs({ tabs, layoutId }: MobileBottomTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : isActivePath(pathname, tab.href);
        const Icon = ICON_MAP[tab.icon] ?? Home;
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative">
            <div className="relative">
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              {(tab.badge ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[8px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-mono transition-colors ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              {tab.label}
            </span>
            {active && (
              <motion.div layoutId={layoutId} className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
