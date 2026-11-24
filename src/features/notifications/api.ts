import api from '../../app/lib/axios';
import type { ApiResponse } from '../../app/lib/api-types';

export interface Notification {
  id: string;
  title: string;
  body: string;
  /** Normalised from the API's `isRead`. Always a real boolean. */
  read: boolean;
  createdAt: string;
  type?: string;
  imageUrl?: string;
}

/** Shape as it actually arrives from GET /api/v1/notifications. */
interface RawNotification {
  id: string;
  title?: string;
  body?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  type?: string;
  imageUrl?: string;
}

function normaliseNotification(raw: RawNotification): Notification {
  return {
    id: raw.id,
    title: raw.title ?? '',
    body: raw.body ?? '',
    // Accept either field; `isRead` is what the server actually sends.
    read: Boolean(raw.isRead ?? raw.read ?? false),
    createdAt: raw.createdAt ?? '',
    type: raw.type,
    imageUrl: raw.imageUrl,
  };
}

export const notificationApi = {
  getNotifications: async (signal?: AbortSignal) => {
    const { data } = await api.get<ApiResponse<{ notifications?: RawNotification[] }>>(
      '/api/v1/notifications',
      { signal },
    );
    if (data.success === false) throw new Error(data.message || 'Could not load notifications.');
    return (data.data?.notifications ?? []).map(normaliseNotification);
  },

  markAsRead: (id: string) => api.patch<ApiResponse<unknown>>(`/api/v1/notifications/${id}/read`),

  markAllAsRead: () => api.patch<ApiResponse<unknown>>('/api/v1/notifications/read'),

  /**
   * Present in the collection but never wired until now:
   *   DELETE /api/v1/notifications      (delete all)
   *   DELETE /api/v1/notifications/:id  (delete one)
   */
  deleteAll: () => api.delete('/api/v1/notifications'),

  deleteOne: (id: string) => api.delete(`/api/v1/notifications/${id}`),
};
