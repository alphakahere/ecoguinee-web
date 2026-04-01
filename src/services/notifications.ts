import { api } from './api';
import type {
  ApiNotification,
  NotificationFilters,
  NotificationsResponse,
} from '@/types/api';

export const notificationsService = {
  async getAll(filters?: NotificationFilters): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>('/notifications', {
      params: filters,
    });
    return data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await api.get<{ count: number }>(
      '/notifications/unread-count',
    );
    return data;
  },

  async markAsRead(id: string): Promise<ApiNotification> {
    const { data } = await api.patch<ApiNotification>(
      `/notifications/${id}/read`,
    );
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteOne(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
