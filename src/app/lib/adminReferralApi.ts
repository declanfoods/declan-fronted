import api from './axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export interface AdminPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/*
|--------------------------------------------------------------------------
| Get User Referral Metrics — GET /admin/referrals/users/:id/metrics
|--------------------------------------------------------------------------
| Quirk: totalNumberOfOrders is a plain number (0) when NOT QUALIFIED, but
| an object { totalNumberOfOrders, totalOrderValue } when QUALIFIED.
| Kept as the union it actually is — don't assume it's always a number.
*/

export interface UserReferralMetricOrders {
  totalNumberOfOrders: number;
  totalOrderValue: number;
}

export interface UserReferralMetricItem {
  id: string;
  fullname: string;
  commissionEligibilityStatus: 'QUALIFIED' | 'NOT QUALIFIED';
  totalNumberOfOrders: number | UserReferralMetricOrders;
  totalCommissionEarnedOnReferral: number;
  totalNetwork: number;
}

/*
|--------------------------------------------------------------------------
| Get Referrals (list, filterable by level) — GET /admin/referrals
|--------------------------------------------------------------------------
| Quirk: commissions is sometimes a numeric string ("0.00") and sometimes
| a bare number (0) depending on the record — kept as the union it is.
*/

export interface AdminReferralListItem {
  id: string;
  fullname: string;
  code: string;
  level: number;
  networkSize: number;
  commissions: string | number;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface AdminReferralFilters {
  level?: number;
  page?: number;
  limit?: number;
}

/*
|--------------------------------------------------------------------------
| Config: Commission & Cashback & Wallet — GET /admin/config/commission
|--------------------------------------------------------------------------
*/

export interface CommissionConfig {
  id: number;
  levelOneCommissionRate: string | number;
  levelTwoCommissionRate: string | number;
  unlockThreshold: string | number;
  minimumMonthlySpend: string | number;
}

export interface CashbackConfig {
  id: number;
  enabled: boolean;
  percentage: string | number;
  minimumSpend: string | number;
}

export interface WalletConfig {
  id: number;
  allowWalletUsage: boolean;
  enableEarnings: boolean;
  enableWithdrawals: boolean;
  autoCreditCashback: boolean;
}

export interface FullCommissionConfigResponse {
  commission: CommissionConfig;
  cashback: CashbackConfig;
  wallet: WalletConfig;
}

export interface UpdateCommissionPayload {
  levelOneCommissionRate: number;
  levelTwoCommissionRate: number;
  unlockThreshold: number;
  minimumMonthlySpend: number;
}

export interface UpdateCashbackPayload {
  enabled: boolean;
  percentage: number;
  minimumSpend: number;
}

export interface UpdateWalletPayload {
  allowWalletUsage: boolean;
  enableEarnings: boolean;
  enableWithdrawals: boolean;
  autoCreditCashback: boolean;
}

/*
|--------------------------------------------------------------------------
| Config: Referral Program — GET /admin/config/referral
|--------------------------------------------------------------------------
*/

export interface ReferralProgramConfig {
  id: number;
  programEnabled: boolean;
  signupRewardEnabled: boolean;
  signupRewardAmount: string | number;
  purchaseBonusEnabled: boolean;
  purchaseBonusAmount: string | number;
  purchaseBonusMinSpend: string | number;
  qualificationPeriodDays: number;
}

export interface UpdateReferralProgramPayload {
  programEnabled: boolean;
  signupRewardEnabled: boolean;
  signupRewardAmount: number;
  purchaseBonusEnabled: boolean;
  purchaseBonusAmount: number;
  purchaseBonusMinSpend: number;
  qualificationPeriodDays: number;
}

/*
|--------------------------------------------------------------------------
| Config: Withdrawals — GET /admin/config/withdrawal
|--------------------------------------------------------------------------
*/

export interface WithdrawalConfig {
  id: number;
  withdrawalsEnabled: boolean;
  minWithdrawalAmount: string | number;
}

export interface UpdateWithdrawalPayload {
  withdrawalsEnabled: boolean;
  minWithdrawalAmount: number;
}

export const adminReferralApi = {
  getUserReferralMetrics: (userId: string, filters?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ referrals: UserReferralMetricItem[]; pagination: AdminPagination }>>(
      `/api/v1/admin/referrals/users/${userId}/metrics`,
      { params: filters }
    ),

  getReferrals: (filters?: AdminReferralFilters) =>
    api.get<ApiResponse<{ referrals: AdminReferralListItem[]; pagination: AdminPagination }>>(
      '/api/v1/admin/referrals',
      { params: filters }
    ),

  // Commission / Cashback / Wallet config
  getCommissionConfig: () =>
    api.get<ApiResponse<FullCommissionConfigResponse>>('/api/v1/admin/config/commission'),

  updateCommissionConfig: (data: UpdateCommissionPayload) =>
    api.patch<ApiResponse<CommissionConfig>>('/api/v1/admin/config/commission', data),

  updateCashbackConfig: (data: UpdateCashbackPayload) =>
    api.patch<ApiResponse<CashbackConfig>>('/api/v1/admin/config/cashback', data),

  updateWalletConfig: (data: UpdateWalletPayload) =>
    api.patch<ApiResponse<WalletConfig>>('/api/v1/admin/config/wallet', data),

  // Referral program config
  getReferralConfig: () =>
    api.get<ApiResponse<ReferralProgramConfig>>('/api/v1/admin/config/referral'),

  updateReferralConfig: (data: UpdateReferralProgramPayload) =>
    api.patch<ApiResponse<ReferralProgramConfig>>('/api/v1/admin/config/referral', data),

  // Withdrawal config
  getWithdrawalConfig: () =>
    api.get<ApiResponse<WithdrawalConfig>>('/api/v1/admin/config/withdrawal'),

  updateWithdrawalConfig: (data: UpdateWithdrawalPayload) =>
    api.patch<ApiResponse<WithdrawalConfig>>('/api/v1/admin/config/withdrawal', data),
};