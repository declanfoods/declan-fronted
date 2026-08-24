import api from './axios';

export interface RiderSignInPayload {
  email: string;
  password: string;
}

export interface StudentInformation {
  level?: string;
  department?: string;
  matricNumber?: string;
}

export interface RiderProfile {
  id: string;
  fullname: string;
  email: string;
  phoneNumberOne: string;
  phoneNumberTwo?: string | null;
  address: string;
  profilePictureUrl?: string | null;
  isStudent?: boolean;
  studentInformation?: StudentInformation;
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
    api.post<ApiResponse<{ accessToken: string }>>(
      '/api/v1/delivery-riders/auth/sign-in',
      data
    ),

  getProfile: () =>
    api.get<ApiResponse<{ rider: RiderProfile }>>(
      '/api/v1/delivery-riders'
    ),
};

export function extractRiderProfile(
  data: { rider: RiderProfile } | RiderProfile
): RiderProfile {
  return (data as { rider?: RiderProfile }).rider ?? (data as RiderProfile);
}