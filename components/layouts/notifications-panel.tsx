'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Flag,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Wrench,
  Clock,
  Megaphone,
  Building2,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/queries/useNotifications';
import { useNotifications } from '@/hooks/queries/useNotifications';
import { useMarkAsRead, useMarkAllAsRead } from '@/hooks/mutations/useMarkAsRead';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiNotification, NotificationType } from '@/types/api';

const ICON_MAP: Record<NotificationType, { icon: typeof Flag; color: string; border: string }> = {
  NEW_REPORT_IN_ZONE:      { icon: Flag,          color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  REPORT_CLAIMED_BY_OTHER: { icon: CheckCircle,   color: 'text-muted-foreground', border: 'border-l-muted-foreground' },
  INTERVENTION_RESOLVED:   { icon: CheckCircle,   color: 'text-[#6FCF4A]', border: 'border-l-[#6FCF4A]' },
  AGENT_INACTIVE:          { icon: AlertCircle,   color: 'text-amber-500', border: 'border-l-amber-500' },
  INTERVENTION_ASSIGNED:   { icon: Wrench,        color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  INTERVENTION_OVERDUE:    { icon: Clock,         color: 'text-[#D94035]', border: 'border-l-[#D94035]' },
  CAMPAIGN_ASSIGNED:       { icon: Megaphone,     color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  REPORT_UNHANDLED:        { icon: AlertTriangle, color: 'text-[#D94035]', border: 'border-l-[#D94035]' },
  ORGANIZATION_CREATED:    { icon: Building2,     color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  USER_CREATED:            { icon: UserPlus,      color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
};

function getRolePrefix(role?: string): string {
  if (!role) return '';
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin';
  if (role === 'MANAGER' || role === 'SUPERVISOR') return '/superviseur';
  if (role === 'AGENT') return '/agent';
  return '';
}

function getDeepLink(n: ApiNotification, prefix: string): string | undefined {
  if (n.reportId) return `${prefix}/signalements/${n.reportId}`;
  if (n.interventionId) return `${prefix}/interventions/${n.interventionId}`;
  if (n.campaignId) return `${prefix}/campagnes/${n.campaignId}`;
  return undefined;
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const rolePrefix = getRolePrefix(currentUser?.role);

  const { data: unreadData } = useUnreadCount();
  const { data: notifData } = useNotifications({ limit: 20 });
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notifData?.data ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: ApiNotification) => {
    if (!n.read) {
      markRead.mutate(n.id);
    }
    const link = getDeepLink(n, rolePrefix);
    if (link) {
      setOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-mono text-primary hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono py-6 text-center">Aucune notification</p>
              ) : notifications.map((n) => {
                const meta = ICON_MAP[n.type] ?? ICON_MAP.NEW_REPORT_IN_ZONE;
                const Icon = meta.icon;
                const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr });

                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 border-l-2 transition-colors text-left',
                      meta.border,
                      !n.read ? 'bg-primary/5' : 'hover:bg-muted/20',
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', meta.color)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs truncate', !n.read && 'font-semibold')}>{n.title}</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">{n.message}</p>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">{timeAgo}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
