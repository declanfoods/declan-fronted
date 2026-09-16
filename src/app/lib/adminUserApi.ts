import api from './axios';
import type { ApiResponse, ApiPagination } from './api-types';

/*
|--------------------------------------------------------------------------
| ADMIN USER MANAGEMENT API
|--------------------------------------------------------------------------
| Changes from the previous version:
|  - `ApiResponse<T>` now comes from the shared `api-types.ts` instead of
|    being redeclared here (it was redeclared in 30 files).
|  - `getUserMetrics()` used to return `Record<string, unknown>`, which made
|    the analytics screen impossible to type. See `AdminUserMetrics` below —
|    the shape is now declared, with a documented assumption.
|  - Pagination type is the shared `ApiPagination` (identical fields).
*/

export type AdminPagination = ApiPagination;

export type AdminUserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

/**
 * GET /api/v1/admin/users/metrics
 *
 * ⚠️ ASSUMPTION: the backend does not document this payload yet. The fields
 * below are the ones the User Analytics screen needs. If the real response
 * differs, only `normaliseUserMetrics()` in
 * `src/components/pages/admin/users/UserAnalytics.tsx` needs to change —
 * every field is read defensively and falls back to a derived value.
 */
export interface AdminUserMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingVerification: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  growthPercent?: number;
  retentionRate?: number;
  monthlyGrowth?: { month: string; value: number }[];
  referralTiers?: { tier: string; label: string; count: number }[];
}

/*
|--------------------------------------------------------------------------
| Get Users (list) — GET /admin/users
|--------------------------------------------------------------------------
*/

export interface AdminUserListItem {
  id: string;
  fullname: string;
  platformId: string;
  emailAddress: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  lifetimeSpend: string;
  referralWalletBalance: string;
  totalOrders: number;
  userStatus: AdminUserStatus;
  lastLogin: string | null;
  joinedAt: string;
}

export interface AdminUserFilters {
  search?: string;
  limit?: number;
  page?: number;
  status?: AdminUserStatus;
}

/*
|--------------------------------------------------------------------------
| Get User By ID — GET /admin/users/:id
|--------------------------------------------------------------------------
*/

export interface AdminUserFinancialOverview {
  referralWalleBalance: string; // sic — typo is in the real API response
  numberOfReferrals: number;
  totalSpend: number;
  orderCount: number;
  cashback: number;
}

export interface AdminUserDetail {
  id: string;
  fullname: string;
  profilePictureUrl: string | null;
  userStatus: AdminUserStatus;
  email: string;
  phoneNumber: string;
  deliveryAddress: string | null;
  lastLogin: string | null;
  joinedAt: string;
  referralCode: string;
  financialOverview: AdminUserFinancialOverview;
}

/*
|--------------------------------------------------------------------------
| Get user orders — GET /admin/users/:id/orders
|--------------------------------------------------------------------------
*/

export interface AdminUserOrderItem {
  itemName: string;
  itemType: 'PRODUCT' | 'FOODPACK';
  imageUrls: string[];
}

export interface AdminUserOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  items: AdminUserOrderItem[];
  rider: { id: string; fullname: string } | null;
}

/*
|--------------------------------------------------------------------------
| Get user activities — GET /admin/users/:id/activities
|--------------------------------------------------------------------------
*/

export interface AdminUserActivity {
  id: string;
  title: string;
  action: string;
  activityType: string;
  createdAt: string;
}

/*
|--------------------------------------------------------------------------
| Get User Transactions — GET /admin/users/:id/transactions
|--------------------------------------------------------------------------
*/

export interface AdminUserTransaction {
  id: string;
  amount: string;
  description: string;
  status: string;
  transactionFor: string;
  transactionType: 'DEBIT' | 'CREDIT';
  reference: string;
  entityId: string;
  createdAt: string;
}

/*
|--------------------------------------------------------------------------
| Get Wallet — GET /admin/users/:id/wallets
|--------------------------------------------------------------------------
*/

export interface AdminUserWallet {
  id: string;
  balance: string;
  pendingBalance: string;
  lifetimeEarned: string;
}

/*
|--------------------------------------------------------------------------
| Get referrals (a user's own downline, admin view) — GET /admin/users/:id/referrals
|--------------------------------------------------------------------------
| Note: response key is singular "referral", not "referrals".
*/

export interface AdminUserReferral {
  id: string;
  fullname: string;
  phoneNumber: string;
  joinedAt: string;
  commissionEligibilityStatus: 'ACTIVE' | 'PENDING';
  commissionEligibilityThreshold: number;
  commissionEligibilityLevelReached: number;
  percentageReached: number;
  numberOfOrders: number;
  totalCommissionEarnedOnReferral: number;
}

/*
|--------------------------------------------------------------------------
| Get referral transactions — GET /admin/users/:id/referral-transactions
|--------------------------------------------------------------------------
| Note: response key is "referral_transactions" (snake_case), unlike
| everything else in this API which is camelCase.
*/

export interface AdminUserReferralTransaction {
  id: string;
  type: 'credit' | 'debit';
  status: string;
  reason: string;
  description: string;
  amount: string;
  sourceUserId: string;
  balanceAfter: string;
  createdAt: string;
}

export const adminUserApi = {
  /** GET /api/v1/admin/users — paginated, searchable, status-filterable. */
  getUsers: (filters?: AdminUserFilters) =>
    api.get<ApiResponse<{ users: AdminUserListItem[]; pagination: ApiPagination }>>(
      '/api/v1/admin/users',
      { params: filters }
    ),

  /** GET /api/v1/admin/users/metrics — aggregate counts for the analytics screen. */
  getUserMetrics: () =>
    api.get<ApiResponse<AdminUserMetrics>>('/api/v1/admin/users/metrics'),

  /** GET /api/v1/admin/users/:id */
  getUserById: (id: string) =>
    api.get<ApiResponse<{ user: AdminUserDetail }>>(`/api/v1/admin/users/${id}`),

  /** PATCH /api/v1/admin/users/:id/suspended — note: no VERB in the path. */
  suspendUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/suspended`),

  /** PATCH /api/v1/admin/users/:id/unsuspend */
  unsuspendUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/unsuspend`),

  /** PATCH /api/v1/admin/users/:id/verify */
  verifyUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/verify`),

  /** GET /api/v1/admin/users/:id/orders */
  getUserOrders: (id: string) =>
    api.get<ApiResponse<{ orders: AdminUserOrder[] }>>(`/api/v1/admin/users/${id}/orders`),

  /** GET /api/v1/admin/users/:id/activities */
  getUserActivities: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ activities: AdminUserActivity[]; pagination: ApiPagination }>>(
      `/api/v1/admin/users/${id}/activities`,
      { params: filters }
    ),

  /** GET /api/v1/admin/users/:id/transactions */
  getUserTransactions: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ transactions: AdminUserTransaction[]; pagination: ApiPagination }>>(
      `/api/v1/admin/users/${id}/transactions`,
      { params: filters }
    ),

  /** GET /api/v1/admin/users/:id/wallets — plural "wallets" in the path. */
  getUserWallet: (id: string) =>
    api.get<ApiResponse<{ wallet: AdminUserWallet }>>(`/api/v1/admin/users/${id}/wallets`),

  /** GET /api/v1/admin/users/:id/referrals */
  getUserReferrals: (id: string) =>
    api.get<ApiResponse<{ referral: AdminUserReferral[] }>>(
      `/api/v1/admin/users/${id}/referrals`
    ),

  /** GET /api/v1/admin/users/:id/referral-transactions */
  getUserReferralTransactions: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<
      ApiResponse<{
        referral_transactions: AdminUserReferralTransaction[];
        pagination: ApiPagination;
      }>
    >(`/api/v1/admin/users/${id}/referral-transactions`, { params: filters }),
};