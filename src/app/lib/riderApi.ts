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

interface SignInResponse {
  token: string;
  deliveryRider?: RiderProfile;
}

export const riderApi = {
  signIn: async (data: RiderSignInPayload) => {
    const response = await api.post<
      ApiResponse<SignInResponse> | { token: string }
    >('/api/v1/delivery-riders/auth/sign-in', data);

    const responseData = response.data;

    // Handle either:
    // { data: { token: '...' } }
    // or
    // { token: '...' }
    const token =
      'data' in responseData
        ? responseData.data.token
        : responseData.token;

    if (!token) {
      throw new Error('Rider login succeeded but no authentication token was returned.');
    }

    // Store rider authentication separately
    localStorage.setItem('riderToken', token);

    return response;
  },

  getProfile: () =>
    api.get<ApiResponse<{ deliveryRider: RiderProfile } | RiderProfile>>(
      '/api/v1/delivery-riders'
    ),
};

// Normalizes either:
// { deliveryRider: {...} }
// or
// {...}
export function extractRiderProfile(
  data: { deliveryRider: RiderProfile } | RiderProfile
): RiderProfile {
  return (
    (data as { deliveryRider?: RiderProfile }).deliveryRider ??
    (data as RiderProfile)
  );
}
