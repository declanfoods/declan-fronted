import api from './axios';
import type { ApiResponse } from './api-types';

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
| FIX: "Mark all as read" appeared to do nothing.
|
| The API returns the read flag as **`isRead`**:
|
|   { "id": "...", "title": "Refer bonus Earned", "body": "...",
|     "isRead": false, "createdAt": "2026-09-06T12:06:..." }
|
| but this file declared the field as `read`, and the bell read it as `n.read`.
| Since `n.read` was always `undefined`, `!n.read` was always `true` — so every
| notification counted as unread no matter what.
|
| The PATCH calls themselves were fine and the server did mark them read; the
| 60-second poll then refetched and the badge shot straight back to full,
| because the flag was being read from a property that doesn't exist.
|
| `normaliseNotification()` below maps `isRead` → `read` on every entry point,
| and keeps accepting a literal `read` field in case the backend later sends
| both. Everything downstream can then use `notification.read` safely.
*/

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

export function normaliseNotification(raw: RawNotification): Notification {
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
  getNotifications: async () => {
    const res = await api.get<ApiResponse<{ notifications?: RawNotification[] }>>(
      '/api/v1/notifications'
    );

    const raw = res.data.data?.notifications ?? [];

    // Normalise here, once, so no screen has to know about `isRead`.
    return {
      ...res,
      data: {
        ...res.data,
        data: { notifications: raw.map(normaliseNotification) },
      },
    };
  },

  markAsRead: (id: string) => api.patch(`/api/v1/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/api/v1/notifications/read'),

  /**
   * Present in the collection but never wired until now:
   *   DELETE /api/v1/notifications      (delete all)
   *   DELETE /api/v1/notifications/:id  (delete one)
   */
  deleteAll: () => api.delete('/api/v1/notifications'),

  deleteOne: (id: string) => api.delete(`/api/v1/notifications/${id}`),
};