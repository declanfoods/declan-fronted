import api from './axios';

export interface RiderSignInPayload {
  email: string;
  password: string;
}

export interface RiderProfile {
  id: string;
  fullname: string;
  email: string;
  phoneNumberOne: string;
  phoneNumberTwo?: string;
  address: string;
  profilePictureUrl: string;
  isStudent?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const riderApi = {
  signIn: (data: RiderSignInPayload) =>
    api.post<{ token: string }>('/api/v1/delivery-riders/auth/sign-in', data),

  getProfile: () =>
    api.get<ApiResponse<{ deliveryRider: RiderProfile } | RiderProfile>>(
      '/api/v1/delivery-riders'
    ),
};

// Normalizes either { deliveryRider: {...} } or a bare profile object.
export function extractRiderProfile(
  data: { deliveryRider: RiderProfile } | RiderProfile
): RiderProfile {
  return (data as { deliveryRider?: RiderProfile }).deliveryRider ?? (data as RiderProfile);
}