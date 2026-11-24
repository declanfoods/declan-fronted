import api from '../../app/lib/axios';
import type { ApiResponse } from '../../app/lib/api-types';
import type { SignInResponse } from './response';

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

export const authApi = {
  signUp: (data: SignUpPayload) =>
    api.post<ApiResponse<{ userId: string }>>('/api/v1/auth/signup', data),

  signIn: (data: SignInPayload) =>
    api.post<SignInResponse>(
      '/api/v1/auth/signin',
      data
    ),

  verifyEmail: (data: { userId: string; token: string }) =>
    api.post<ApiResponse<unknown>>('/api/v1/auth/verify-email', data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<unknown>>('/api/v1/auth/forgot-password', { email }),

  resetPassword: (data: {
    userId: string;
    token: string;
    newPassword: string;
  }) => api.patch<ApiResponse<unknown>>('/api/v1/auth/password-reset', data),
};
