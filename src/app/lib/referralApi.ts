import api from './axios';

export interface ReferralPerson {
  firstName: string;
  lastName: string;
  dateJoined: string;
  numberOfDeliveredOrders: number;
  totalAmountOfDeliveredOrders: string;
}

export interface ReferralsMetrics {
  referralCode: string;
  totalDirectReferrals: number;
  totalActiveReferrals: number;
  referrals: ReferralPerson[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const referralApi = {
  getReferralCode: () =>
    api.get<ApiResponse<{ referralCode: string }>>('/api/v1/referrals/code'),

  getReferrals: () =>
    api.get<ApiResponse<{ referrals: ReferralPerson[] }>>('/api/v1/referrals'),

  getReferralById: (id: string) =>
    api.get<ApiResponse<any>>(`/api/v1/referrals/${id}`),
};