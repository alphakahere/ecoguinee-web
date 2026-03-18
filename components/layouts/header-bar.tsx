'use client';

import { Bell, ChevronRight, Menu } from 'lucide-react';
import type { ReactNode } from 'react';

interface HeaderBarProps {
  roleIcon: ReactNode;
  roleLabel: string;
  pageLabel: string;
  onMobileMenuOpen?: () => void;
  notifications?: number;
  rightSlot?: ReactNode;
  mobileLeftSlot?: ReactNode;
}

export function HeaderBar({
  roleIcon, roleLabel, pageLabel,
  onMobileMenuOpen,
  notifications = 0, rightSlot, mobileLeftSlot,
}: HeaderBarProps) {
  const isRoot = pageLabel === 'Dashboard' || pageLabel === 'Tableau de bord' || pageLabel === 'Accueil';

  return (
    <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card/95 backdrop-blur-md z-20 sticky top-0">
      <div className="flex items-center gap-3">
        {onMobileMenuOpen && (
          <button onClick={onMobileMenuOpen} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50">
            <Menu className="w-4 h-4" />
          </button>
        )}
        {mobileLeftSlot}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            {roleIcon}
            <span>{roleLabel}</span>
            {!isRoot && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">{pageLabel}</span>
              </>
            )}
          </div>
          <h1 className="font-bold text-lg leading-none hidden sm:block">{pageLabel}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        <button className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
