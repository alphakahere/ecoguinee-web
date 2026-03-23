'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Flag, Wrench, User, MapPin, Activity, LogOut,
  LayoutDashboard, Users, BarChart3, Settings, Megaphone, Map,
  Building2, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { isActivePath } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Flag, Wrench, User, LayoutDashboard, Users, BarChart3,
  Settings, Megaphone, Map, Building2, AlertTriangle, ShieldCheck, Activity,
};

interface SidebarNavProps {
  items: (NavItem & { count?: number; alert?: boolean; exact?: boolean })[];
  userInfo: { name: string; initials: string; subtitle: string };
  roleLabel: string;
  roleIcon?: string;
  layoutId: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({
  items, userInfo, roleLabel, roleIcon = 'Activity', layoutId,
  collapsed = false, onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
  };
  const RoleIcon = ICON_MAP[roleIcon] ?? Activity;

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border grain-overlay">
      {/* Brand */}
      <div className={`flex items-center gap-3 py-4 border-b border-sidebar-border h-18 shrink-0 ${collapsed ? 'px-3 justify-center' : 'px-4'}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sidebar-foreground font-bold text-sm leading-none">EcoGuinée</p>
            <div className="flex items-center gap-1 mt-1">
              <RoleIcon className="w-3 h-3 text-sidebar-accent-foreground" />
              <p className="text-[10px] font-mono text-sidebar-accent-foreground uppercase tracking-[0.12em]">
                {roleLabel}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {items.map((item) => {
            const active = item.exact !== undefined
              ? (item.exact ? pathname === item.href : pathname.startsWith(item.href))
              : isActivePath(pathname, item.href);
            const Icon = ICON_MAP[item.icon] ?? Home;

            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg transition-all group relative border-l-2 ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                  } ${
                    active ? 'bg-sidebar-accent border-sidebar-accent-foreground' : 'border-transparent hover:bg-sidebar-accent/50'
                  }`}
                  style={active && !collapsed ? { paddingLeft: '10px' } : {}}
                >
                  {active && (
                    <motion.div
                      layoutId={layoutId}
                      className="absolute inset-0 bg-sidebar-accent rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 relative z-10 transition-colors ${
                    active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                  }`} />
                  {!collapsed && (
                    <>
                      <span className={`text-sm font-mono flex-1 relative z-10 transition-colors ${
                        active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                      }`}>
                        {item.label}
                      </span>
                      {(item.badge !== undefined && item.badge > 0) && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md relative z-10 bg-primary/15 text-primary">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md relative z-10 ${
                          item.alert ? 'bg-destructive/20 text-destructive' : 'bg-sidebar-foreground/10 text-sidebar-foreground/50'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && ((item.badge !== undefined && item.badge > 0) || (item.count !== undefined && item.count > 0)) && (
                    <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary text-[8px] text-white flex items-center justify-center font-bold z-10">
                      {item.badge ?? item.count}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom user card */}
      <div className={`border-t border-sidebar-border py-3 shrink-0 space-y-2 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInfo.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{userInfo.name}</p>
                <p className="text-[10px] font-mono text-sidebar-accent-foreground truncate">{userInfo.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-mono text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /><span>Déconnexion</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={userInfo.name}>
              {userInfo.initials}
            </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Se déconnecter"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
