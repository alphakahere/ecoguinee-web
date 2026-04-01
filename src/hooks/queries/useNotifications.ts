import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { notificationsService } from '@/services/notifications';
import type { NotificationFilters } from '@/types/api';

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationsService.getAll(filters),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 60_000,
  });
}
