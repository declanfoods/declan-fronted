import api from './axios';
import type { AdminPagination } from './adminReferralApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export type AdminUserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

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
  getUsers: (filters?: AdminUserFilters) =>
    api.get<ApiResponse<{ users: AdminUserListItem[]; pagination: AdminPagination }>>(
      '/api/v1/admin/users',
      { params: filters }
    ),

  getUserMetrics: () =>
    // Exact shape not documented yet — kept loose until a sample response is shared.
    api.get<ApiResponse<Record<string, unknown>>>('/api/v1/admin/users/metrics'),

  getUserById: (id: string) =>
    api.get<ApiResponse<{ user: AdminUserDetail }>>(`/api/v1/admin/users/${id}`),

  suspendUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/suspended`),

  unsuspendUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/unsuspend`),

  verifyUser: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/verify`),

  getUserOrders: (id: string) =>
    api.get<ApiResponse<{ orders: AdminUserOrder[] }>>(`/api/v1/admin/users/${id}/orders`),

  getUserActivities: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ activities: AdminUserActivity[]; pagination: AdminPagination }>>(
      `/api/v1/admin/users/${id}/activities`,
      { params: filters }
    ),

  getUserTransactions: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ transactions: AdminUserTransaction[]; pagination: AdminPagination }>>(
      `/api/v1/admin/users/${id}/transactions`,
      { params: filters }
    ),

  getUserWallet: (id: string) =>
    api.get<ApiResponse<{ wallet: AdminUserWallet }>>(`/api/v1/admin/users/${id}/wallets`),

  getUserReferrals: (id: string) =>
    api.get<ApiResponse<{ referral: AdminUserReferral[] }>>(
      `/api/v1/admin/users/${id}/referrals`
    ),

  getUserReferralTransactions: (id: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ referral_transactions: AdminUserReferralTransaction[]; pagination: AdminPagination }>>(
      `/api/v1/admin/users/${id}/referral-transactions`,
      { params: filters }
    ),
};