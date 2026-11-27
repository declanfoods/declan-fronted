import api from '../../../app/lib/axios';
import type { ApiResponse, ApiPagination } from '../../../app/lib/api-types';

export type AdminPagination = ApiPagination;

export type AdminUserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

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

export const adminUserExportColumns = [
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'customerLocation', label: 'Customer Location' },
  { key: 'dateJoined', label: 'Date Joined' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'whatsAppLink', label: 'WhatsApp Link' },
  { key: 'completedOrderCount', label: 'Completed Orders' },
  { key: 'cancelledOrderCount', label: 'Cancelled Orders' },
  { key: 'referralCount', label: 'Referral Count' },
  { key: 'hasReferrals', label: 'Has Referrals' },
  { key: 'referralWalletBalance', label: 'Referral Wallet Balance' },
  { key: 'totalOrderAmount', label: 'Total Order Amount' },
] as const;

export type AdminUserExportColumn = (typeof adminUserExportColumns)[number]['key'];
export type AdminUserExportFormat = 'csv' | 'xlsx';

export interface AdminUserExportRequest {
  format: AdminUserExportFormat;
  startDate?: string;
  endDate?: string;
  includeSuspended: boolean;
  columns?: AdminUserExportColumn[];
}

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
  referralPrivilegesEnabled: boolean;
}

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

export interface AdminUserActivity {
  id: string;
  title: string;
  action: string;
  activityType: string;
  createdAt: string;
}

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

export interface AdminUserWallet {
  id: string;
  balance: string;
  pendingBalance: string;
  lifetimeEarned: string;
}

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

export interface AdminUpdateWalletBalanceRequest {
  amount: number;
  operation: 'CREDIT' | 'DEBIT';
  reason: string;
}

export const adminUserApi = {
  /** GET /api/v1/admin/users — paginated, searchable, status-filterable. */
  getUsers: (filters?: AdminUserFilters) =>
    api.get<ApiResponse<{ users: AdminUserListItem[]; pagination: ApiPagination }>>(
      '/api/v1/admin/users',
      { params: filters }
    ),

  downloadList: (body: AdminUserExportRequest) =>
    api.post<Blob>('/api/v1/admin/users/download-list', body, {
      responseType: 'blob',
      validateStatus: (status) => status === 200,
    }),

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

  updateWalletBalance: (userId: string, body: AdminUpdateWalletBalanceRequest) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/users/${userId}/referral-wallet/balance/update`,
      body,
    ),

  disableReferralPrivileges: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/referral-privileges/disable`),

  enableReferralPrivileges: (userId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/users/${userId}/referral-privileges/enable`),
};
