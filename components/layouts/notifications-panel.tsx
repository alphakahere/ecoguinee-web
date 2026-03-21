'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Megaphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  borderColor: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: AlertTriangle, title: 'Nouveau signalement critique', detail: 'Ratoma — Déchets solides', time: 'Il y a 2h', read: false, borderColor: 'border-l-[#D94035]' },
  { id: '2', icon: CheckCircle, title: 'Intervention résolue', detail: 'PME LVG Smart — Kaloum', time: 'Il y a 5h', read: false, borderColor: 'border-l-[#6FCF4A]' },
  { id: '3', icon: Megaphone, title: 'Campagne démarrée', detail: 'Sensibilisation Matam', time: 'Hier', read: true, borderColor: 'border-l-[#E8A020]' },
];

interface NotificationsPanelProps {
  count: number;
}

export function NotificationsPanel({ count }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const displayCount = count > 0 ? count : unread;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
            {displayCount > 9 ? '9+' : displayCount}
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
                {unread > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
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
              ) : notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-l-2 transition-colors',
                    n.borderColor,
                    !n.read ? 'bg-primary/5' : 'hover:bg-muted/20',
                  )}
                >
                  <n.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs truncate', !n.read && 'font-semibold')}>{n.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{n.detail}</p>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
