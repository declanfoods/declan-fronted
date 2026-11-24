import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi, type Notification } from './api';

const notificationsKey = ['customer', 'notifications'] as const;

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: ({ signal }) => notificationApi.getNotifications(signal),
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
}

export function markNotificationsRead(notifications: Notification[], id?: string) {
  return notifications.map((notification) =>
    id === undefined || notification.id === id ? { ...notification, read: true } : notification,
  );
}

export function useMarkNotificationsRead() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (id?: string) => {
      const { data } = await (id === undefined
        ? notificationApi.markAllAsRead()
        : notificationApi.markAsRead(id));
      if (data?.success === false) throw new Error(data.message || 'Could not mark notifications as read.');
    },
    onSuccess: (_, id) => {
      client.setQueryData<Notification[]>(notificationsKey, (current) =>
        current ? markNotificationsRead(current, id) : current,
      );
    },
    onSettled: () => client.invalidateQueries({ queryKey: notificationsKey }),
  });
}
