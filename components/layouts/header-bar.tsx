'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, Menu, User, Settings, LogOut, Shield } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProfileInfo {
  name: string;
  initials: string;
  subtitle: string;
  roleBadge: string;
  profileHref: string;
  settingsHref: string;
}

interface HeaderBarProps {
  roleIcon: ReactNode;
  roleLabel: string;
  pageLabel: string;
  onMobileMenuOpen?: () => void;
  notifications?: number;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  mobileLeftSlot?: ReactNode;
  profile?: ProfileInfo;
}

export function HeaderBar({
  roleIcon, roleLabel, pageLabel,
  onMobileMenuOpen,
  notifications = 0, leftSlot, rightSlot, mobileLeftSlot,
  profile,
}: HeaderBarProps) {
  const router = useRouter();
  const isRoot = pageLabel === 'Dashboard' || pageLabel === 'Tableau de bord' || pageLabel === 'Accueil';
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="shrink-0 h-18 flex items-center justify-between px-4 border-b border-border bg-card/95 backdrop-blur-md z-20 sticky top-0">
      <div className="flex items-center gap-3">
        {onMobileMenuOpen && (
          <button onClick={onMobileMenuOpen} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50">
            <Menu className="w-4 h-4" />
          </button>
        )}
        {mobileLeftSlot}
        {leftSlot}
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

        {profile && (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
            >
              {profile.initials}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {profile.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{profile.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate">{profile.subtitle}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 w-fit">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-mono text-primary font-bold uppercase">{profile.roleBadge}</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      href={profile.profileHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-mono text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Mon profil
                    </Link>
                    <Link
                      href={profile.settingsHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-mono text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Paramètres
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border py-1.5">
                    <button
                      onClick={() => { setProfileOpen(false); router.push('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-mono text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
