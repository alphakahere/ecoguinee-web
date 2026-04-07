'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUnreadCount, useNotifications } from '@/hooks/queries/useNotifications';
import { useMarkAllAsRead, useMarkAsRead } from '@/hooks/mutations/useMarkAsRead';
import type { ApiNotification, NotificationType } from '@/types/api';

const ICON_MAP: Record<NotificationType, { icon: typeof Bell; color: string; border: string }> = {
  NEW_REPORT_IN_ZONE:      { icon: Bell, color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  REPORT_CLAIMED_BY_OTHER: { icon: CheckCircle, color: 'text-muted-foreground', border: 'border-l-muted-foreground' },
  INTERVENTION_RESOLVED:   { icon: CheckCircle, color: 'text-[#6FCF4A]', border: 'border-l-[#6FCF4A]' },
  AGENT_INACTIVE:          { icon: Bell, color: 'text-amber-500', border: 'border-l-amber-500' },
  INTERVENTION_ASSIGNED:   { icon: Bell, color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  INTERVENTION_OVERDUE:    { icon: Bell, color: 'text-[#D94035]', border: 'border-l-[#D94035]' },
  CAMPAIGN_ASSIGNED:       { icon: Bell, color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  REPORT_UNHANDLED:        { icon: Bell, color: 'text-[#D94035]', border: 'border-l-[#D94035]' },
  ORGANIZATION_CREATED:    { icon: Bell, color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
  USER_CREATED:            { icon: Bell, color: 'text-[#2D7D46]', border: 'border-l-[#2D7D46]' },
};

function getDeepLink(n: ApiNotification, prefix: string): string | undefined {
  if (n.reportId) return `${prefix}/signalements/${n.reportId}`;
  if (n.interventionId) return `${prefix}/interventions/${n.interventionId}`;
  if (n.campaignId) return `${prefix}/campagnes/${n.campaignId}`;
  return undefined;
}

export function NotificationsPage({ rolePrefix }: { rolePrefix: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data: unreadData } = useUnreadCount();
  const { data: notifData, isLoading, isError } = useNotifications({ page, limit });
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notifData?.data ?? [];
  const total = notifData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const title = useMemo(() => {
    if (unreadCount <= 0) return 'Notifications';
    return `Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`;
  }, [unreadCount]);

  const handleClick = (n: ApiNotification) => {
    if (!n.read) markRead.mutate(n.id);
    const link = getDeepLink(n, rolePrefix);
    if (link) router.push(link);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total} notification{total !== 1 ? 's' : ''}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-mono text-primary hover:underline"
            >
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-muted-foreground font-mono py-10 text-center">Chargement…</p>
        ) : isError ? (
          <p className="text-sm text-muted-foreground font-mono py-10 text-center">Impossible de charger.</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono py-10 text-center">Aucune notification</p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const meta = ICON_MAP[n.type] ?? ICON_MAP.NEW_REPORT_IN_ZONE;
              const Icon = meta.icon;
              const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr });
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={cn(
                    'w-full flex items-start gap-3 px-5 py-4 border-l-2 transition-colors text-left',
                    meta.border,
                    !n.read ? 'bg-primary/5' : 'hover:bg-muted/20',
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', meta.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm truncate', !n.read && 'font-semibold')}>{n.title}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5">{timeAgo}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
          <span className="text-[10px] font-mono text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono border border-border hover:bg-muted disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono border border-border hover:bg-muted disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

