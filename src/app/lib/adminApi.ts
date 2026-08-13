import api from './axios';

export interface AdminSignInPayload {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminApi = {
  signIn: (data: AdminSignInPayload) =>
    api.post<ApiResponse<{ accessToken: string }>>(
      '/api/v1/admin/auth/signin',
      data
    ),
};
