import api from '../../app/lib/axios';
import type { SignInResponse } from './response';

export interface AdminSignInPayload {
  email: string;
  password: string;
}

export const adminApi = {
  signIn: (data: AdminSignInPayload) =>
    api.post<SignInResponse>(
      '/api/v1/admin/auth/signin',
      data
    ),
};
