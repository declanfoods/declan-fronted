import api from './axios';

export interface SignUpPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  referralCode?: string;
}

export interface SignInPayload {
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

export const authApi = {
  signUp: (data: SignUpPayload) =>
    api.post<ApiResponse<{ userId: string }>>('/api/v1/auth/signup', data),

  signIn: (data: SignInPayload) =>
    api.post<ApiResponse<{ accessToken: string }>>(  // ← was token, now accessToken
      '/api/v1/auth/signin',
      data
    ),

  verifyEmail: (data: { userId: string; token: string }) =>
    api.post('/api/v1/auth/verify-email', data),

  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (data: {
    userId: string;
    token: string;
    newPassword: string;
  }) => api.patch('/api/v1/auth/password-reset', data),
};