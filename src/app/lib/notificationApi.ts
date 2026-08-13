import api from './axios';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type?: string;
  imageUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const notificationApi = {
  // Response shape not confirmed — trying common wrapper keys defensively
  getNotifications: () =>
    api.get<ApiResponse<any>>('/api/v1/notifications'),

  markAsRead: (id: string) =>
    api.patch(`/api/v1/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/api/v1/notifications/read'),
};