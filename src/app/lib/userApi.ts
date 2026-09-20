import api from './axios';

// ─── Response types ───────────────────────────────────────

/*
|--------------------------------------------------------------------------
| FIX: the profile picture was being read from a field that does not exist
|--------------------------------------------------------------------------
| `ProfilePhoto` and `UserProfile.profile.profilePhoto` described a nested
| shape like this:
|
|     profile: { firstName, lastName, profilePhoto: { id, url } }
|
| The backend does not send that, and never has. Searching the whole 593 KB
| API collection for the string "profilePhoto" returns ZERO matches. What it
| actually sends is a flat `profilePictureUrl` on the user object, which is
| the same field name used on:
|
|     GET  /api/v1/admin/users            (list)   → profilePictureUrl
|     GET  /api/v1/admin/users/:id        (detail) → profilePictureUrl
|     POST /api/v1/admin/delivery-riders  (create) → profilePictureUrl
|     the referral and payout payloads             → profilePictureUrl
|
| So on the customer's own profile screen, `photoUrl` was always null and the
| avatar fell back to initials no matter what the backend sent. The photo
| simply could not appear. That is the bug behind "add a profile picture to
| the user profile".
|
| `UserProfile` now declares the real field. `profilePhoto` is kept as an
| optional, deprecated escape hatch ONLY so any cached or older payload that
| does happen to carry it still renders; nothing new should read it.
*/

/** @deprecated Not part of the API. Kept only as a defensive fallback. */
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


export interface DeliveryAddress {
  id: string;
  nameOfCustomer: string;
  addressLine: string;
  state: string;
  country: string;
  emailAddress: string
}

export interface GetDeliveryAddressResponse {
  deliveryAddresses: DeliveryAddress[]
}
// ─── Generic API wrapper ──────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

// ─── API calls ────────────────────────────────────────────

export const userApi = {
  getDeliveryAddresses: () => 
    api.get<ApiResponse<GetDeliveryAddressResponse>>('api/v1/delivery-addresses'),
  
 getProfileOverview: () =>
  api.get<ApiResponse<{ user: UserProfile }>>('/api/v1/users/profile-overview'),

  getMetricsOverview: () =>
    api.get<ApiResponse<{ metrics: UserMetrics }>>('/api/v1/users/metrics-overview'),

  getRewardsOverview: () =>
    api.get<ApiResponse<{ metrics: RewardsMetrics }>>('/api/v1/users/rewards-overview'),

  getOrdersOverview: () =>
    api.get<ApiResponse<{ orders: OrderOverview[] }>>('/api/v1/users/orders-overview'),

  getReferralsOverview: () =>
    api.get<ApiResponse<{ metrics: ReferralsMetrics }>>('/api/v1/users/referrals-overview'),
};