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



import api from './axios';

export interface ReferralUser {
  id: string;
  email: string;
  role: string;
  phoneNumber: string;
  accountStatus: string;
  profile: { firstName?: string; lastName?: string } | null;
  joinedAt: string;
}

export interface ReferralCodeData {
  code: string;
  user: ReferralUser;
}

export interface ReferralWallet {
  id: string;
  availableBalance: string;
  pendingBalance: string;
  lifetimeEarned: string;
}

export interface ReferralHistoryItem {
  id: string;
  title: string;
  description: string;
  amount: string;
  createdAt: string;
}

export interface ReferralPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type CommissionEligibilityStatus = 'ACTIVE' | 'PENDING';

export interface DirectReferral {
  id: string;
  fullname: string;
  phoneNumber: string;
  joinedAt: string;
  commissionEligibilityStatus: CommissionEligibilityStatus;
  commissionEligibilityThreshold: number;
  commissionEligibilityLevelReached: number;
  percentageReached: number;
  numberOfOrders: number;
  totalCommissionEarnedOnReferral: number;
}

export interface ReferralLevelEarning {
  level: number;
  amountEarned: number;
  percentage: number;
}

export interface ReferralMetrics {
  qualifiedCount: number;
  totalNetwork: number;
  networkPerformance: {
    amountEarnedPerlevel: ReferralLevelEarning[];
    totalEarned: number;
  };
}

export interface ReferralFilters {
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const referralApi = {
  getCode: () => api.get<ApiResponse<ReferralCodeData>>('/api/v1/referrals/code'),

  getWallet: () =>
    api.get<ApiResponse<{ referralWallet: ReferralWallet }>>('/api/v1/referrals/wallet'),

  getHistory: (filters?: ReferralFilters) =>
    api.get<ApiResponse<{ history: ReferralHistoryItem[]; pagination: ReferralPagination }>>(
      '/api/v1/referrals/history',
      { params: filters }
    ),

  getNetworks: (filters?: ReferralFilters) =>
    api.get<ApiResponse<{ referrals: DirectReferral[]; pagination: ReferralPagination }>>(
      '/api/v1/referrals/networks',
      { params: filters }
    ),

  getDownline: (id: string) =>
    api.get<ApiResponse<unknown>>(`/api/v1/referrals/${id}`),

  getMetrics: () =>
    api.get<ApiResponse<{ metrics: ReferralMetrics }>>('/api/v1/referrals/metrics'),
};