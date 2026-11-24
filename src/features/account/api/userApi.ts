import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';

import type { DeliveryAddress } from './addressApi';

/** Legacy avatar shape accepted for older profile payloads. */
export interface ProfilePhoto {
  id: string;
  url: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  /** Full name as the API sends it. Present on profile-overview. */
  fullname?: string;
  /** Account status, e.g. 'ACTIVE'. Present on profile-overview. */
  userStatus?: string;
  /** THE real avatar field. Flat, not nested. null when unset. */
  profilePictureUrl?: string | null;
  profile: {
    firstName: string;
    lastName: string;
    /** @deprecated see note above — not sent by this API. */
    profilePhoto?: ProfilePhoto | null;
  };
  deliveryAddresses: DeliveryAddress[];
}

/**
 * Resolves the avatar URL for a user object, whichever shape it arrives in.
 *
 * Every screen that shows a face should go through this rather than reaching
 * for a field directly — the flat `profilePictureUrl` is the real one, the
 * nested `profilePhoto.url` is a legacy fallback, and `''` (an empty string,
 * which some referral payloads really do return) must be treated as "no
 * picture" rather than handed to an <img> as a broken src.
 */
export function userAvatarUrl(user?: {
  profilePictureUrl?: string | null;
  profile?: { profilePhoto?: ProfilePhoto | null } | null;
} | null): string | null {
  const flat = user?.profilePictureUrl;
  if (typeof flat === 'string' && flat.trim() !== '') return flat;

  const nested = user?.profile?.profilePhoto?.url;
  if (typeof nested === 'string' && nested.trim() !== '') return nested;

  return null;
}

export interface UserMetrics {
  totalOrders: number;
  totalSpent: string;
  totalNumberOfDirectReferrals: number;
  cashback: string;
}

export interface RewardsMetrics {
  availableCashback: string;
  amountPaidThisMonth: string;
  monthlyTarget: string;
  amountToGo: string;
  cashbackRate: string;
  totalAmountPaidAllTime: string;
}

export interface OrderOverview {
  id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: 'PENDING' | 'PREPARING' | 'PACKED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  totalQuantityOfItems: number;
}

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

// ─── API calls ────────────────────────────────────────────

export const userApi = {
  getProfileOverview: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ user: UserProfile }>>('/api/v1/users/profile-overview', { signal }),

  getMetricsOverview: () =>
    api.get<ApiResponse<{ metrics: UserMetrics }>>('/api/v1/users/metrics-overview'),

  getRewardsOverview: () =>
    api.get<ApiResponse<{ metrics: RewardsMetrics }>>('/api/v1/users/rewards-overview'),

  getOrdersOverview: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ orders: OrderOverview[] }>>('/api/v1/users/orders-overview', { signal }),

  getReferralsOverview: () =>
    api.get<ApiResponse<{ metrics: ReferralsMetrics }>>('/api/v1/users/referrals-overview'),
};
