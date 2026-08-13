import api from './axios';

export interface RiderSignInPayload {
  email: string;
  password: string;
}

export const riderApi = {
  signIn: (data: RiderSignInPayload) =>
    api.post<{ token: string }>('/api/v1/delivery-riders/auth/sign-in', data),
};