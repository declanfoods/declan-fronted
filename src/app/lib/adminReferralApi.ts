import api from './axios';
import type { ApiResponse, ApiPagination } from './api-types';
import type { PayoutBankDetails, PayoutRequestStatus, PayoutVerificationStatus } from './referralApi';

/*
|--------------------------------------------------------------------------
| ADMIN PAYOUT types — folder "Admin Referrals > Referral Payout"
|--------------------------------------------------------------------------
| Verified against the collection's saved responses:
|
|   list   GET /admin/referrals/withdrawal-requests
|          data.{ payoutRequests[], pagination }
|            { id, user{id,fullname,profilePictureUrl}, accountDetails{...},
|              amount: "2000.00", requestStatus: "PENDING", createdAt }
|
|   detail GET /admin/referrals/withdrawal-requests/:id
|          data.payoutRequest — everything above PLUS:
|              verifiedAt, approvedAt,
|              wallet { referralWalletBalance, cashbackWalletBalance },
|              previousWithdrawals [{ amount, status }]
*/

export interface AdminPayoutRequester {
  id: string;
  fullname: string;
  /** Empty string, not null, when the user has no avatar. */
  profilePictureUrl: string | null;
}

export interface AdminPayoutRequest {
  id: string;
  user: AdminPayoutRequester;
  /** NB: `accountDetails` on the admin side, `bankDetails` on the customer side. */
  accountDetails: PayoutBankDetails;
  /** String on reads ("2000.00") — run it through Number(). */
  amount: string | number;
  requestStatus: PayoutRequestStatus;
  createdAt: string;
  /** Only present on the customer-side endpoints. */
  verificationStatus?: PayoutVerificationStatus;
}

export interface AdminPayoutWallet {
  referralWalletBalance: string | number;
  cashbackWalletBalance: string | number;
}

export interface AdminPreviousWithdrawal {
  amount: string | number;
  status: PayoutRequestStatus;
}

export interface AdminPayoutRequestDetail extends AdminPayoutRequest {
  verifiedAt: string | null;
  approvedAt: string | null;
  wallet: AdminPayoutWallet;
  previousWithdrawals: AdminPreviousWithdrawal[];
}

/**
 * Query params for the payout queue.
 *
 * ⚠️ The collection documents NO query parameters on any endpoint, so
 * `requestStatus` is an inference from the response field name. `page`/`limit`
 * are safe (the response carries a pagination block). The queue screen
 * re-filters client-side so the status tabs work either way.
 */
export interface PayoutRequestFilters {
  page?: number;
  limit?: number;
  requestStatus?: PayoutRequestStatus;
}

/*
|--------------------------------------------------------------------------
| ADMIN REFERRAL API
|--------------------------------------------------------------------------
| Changes from the previous version:
|  - `ApiResponse<T>` now imported from the shared `api-types.ts`.
|  - `AdminPagination` re-exported as an alias of `ApiPagination` so the
|    existing `import type { AdminPagination } from './adminReferralApi'`
|    in other modules keeps working.
|  - Endpoint paths confirmed against the /api/v1/admin/config/* controller.
|    Highlights:
|      GET   /admin/config/commission   → { commission, cashback, wallet }
|      PATCH /admin/config/commission   → commission only
|      PATCH /admin/config/cashback     → cashback only
|      PATCH /admin/config/wallet       → wallet only
|      GET   /admin/config/referral     → referral program
|      PATCH /admin/config/referral
|      GET   /admin/config/withdrawal
|      PATCH /admin/config/withdrawal
*/

export type AdminPagination = ApiPagination;

/*
|--------------------------------------------------------------------------
| Get User Referral Metrics — GET /admin/referrals/users/:id/metrics
|--------------------------------------------------------------------------
| ⚠️ CORRECTED against the official Postman docs.
|
| This endpoint returns a SINGLE OBJECT under `data.referral` — NOT an array
| of referrals. The earlier version of this file typed it as
| `{ referrals: [...], pagination }`, which meant `data.referrals` was always
| `undefined` and the member-detail screen rendered "No referrals in this
| view." no matter what. Two different endpoints were being conflated:
|
|   GET /admin/referrals/users/:id/metrics            ← header summary (THIS)
|   GET /admin/referrals/users/:id/direct-referrals   ← the actual list
|
| Real 200 response (verbatim from the docs):
| {
|   "data": {
|     "referral": {
|       "id": "08e52bee-…", "fullname": "Justice Amadi",
|       "profilePictureUrl": "", "activeStatus": "ACTIVE",
|       "referralCode": "0Js5PY5o", "joinedAt": "2026-09-06T07:55:34.842Z",
|       "metrics": {
|         "network": 10, "lifetimeCommission": 11045.5, "qualified": 3,
|         "lifetimeRevenue": 167455, "directReferrals": 10
|       }
|     }
|   }
| }
*/

export interface AdminUserReferralSummaryMetrics {
  network: number;
  lifetimeCommission: number;
  qualified: number;
  lifetimeRevenue: number;
  directReferrals: number;
}

export interface AdminUserReferralSummary {
  id: string;
  fullname: string;
  profilePictureUrl: string | null;
  activeStatus: string;
  referralCode: string;
  joinedAt: string;
  metrics: AdminUserReferralSummaryMetrics;
}

/*
|--------------------------------------------------------------------------
| Get User Direct Referrals — GET /admin/referrals/users/:id/direct-referrals
|--------------------------------------------------------------------------
| Documents: "Fetched referral network successfully"
|
| Quirk CONFIRMED by the docs: `totalNumberOfOrders` is a plain number (0)
| when NOT QUALIFIED, but an object { totalNumberOfOrders, totalOrderValue }
| when QUALIFIED. Real example showing BOTH in one array:
|
|   { "commissionEligibilityStatus": "NOT QUALIFIED",
|     "totalNumberOfOrders": 0, … }
|   { "commissionEligibilityStatus": "QUALIFIED",
|     "totalNumberOfOrders": { "totalNumberOfOrders": 5, "totalOrderValue": 75705 }, … }
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
  /**
   * GET /admin/referrals/users/:id/metrics
   * Header summary only — ONE member's aggregate metrics, not a list.
   * For the list of their direct referrals use `getUserDirectReferrals`.
   */
  getUserReferralMetrics: (userId: string) =>
    api.get<ApiResponse<{ referral: AdminUserReferralSummary }>>(
      `/api/v1/admin/referrals/users/${userId}/metrics`
    ),

  /**
   * GET /admin/referrals/users/:id/direct-referrals
   * The paginated list of people this user referred directly.
   */
  getUserDirectReferrals: (userId: string, filters?: { page?: number; limit?: number }) =>
    api.get<
      ApiResponse<{ referrals: UserReferralMetricItem[]; pagination: ApiPagination }>
    >(`/api/v1/admin/referrals/users/${userId}/direct-referrals`, { params: filters }),

  /** GET /admin/referrals — the platform-wide referrer list, filterable by level. */
  getReferrals: (filters?: AdminReferralFilters) =>
    api.get<ApiResponse<{ referrals: AdminReferralListItem[]; pagination: ApiPagination }>>(
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

  /*
  |----------------------------------------------------------------------
  | Admin Referrals → Referral Payout  (NEW folder — real endpoints)
  |----------------------------------------------------------------------
  | These replace the two demo-badged screens. Every one of these endpoints
  | is now in the collection with a saved response, so the payout queue and
  | the payout detail screen are fully live — no mock data left.
  |
  | The old screens called `/admin/referrals/payouts*`, which never existed.
  |
  | ⚠️ Shape quirks (confirmed against the saved responses):
  |   • The list/detail return the bank block as `accountDetails`, while the
  |     customer-side endpoints use `bankDetails` for the same thing. Both are
  |     normalised by `bankOf()` from referralApi — import that, don't
  |     re-implement it.
  |   • `amount` is a STRING here ("2000.00"). Use Number() before maths.
  |   • approve takes NO body and returns `data: {}`.
  |   • reject REQUIRES a `reason` string.
  |   • The detail response carries `wallet` and `previousWithdrawals`, which
  |     together are the affordability context an approver needs.
  */

  /** GET /api/v1/admin/referrals/withdrawal-requests → the payout queue. */
  getPayoutRequests: (filters?: PayoutRequestFilters) =>
    api.get<ApiResponse<{ payoutRequests: AdminPayoutRequest[]; pagination: ApiPagination }>>(
      '/api/v1/admin/referrals/withdrawal-requests',
      { params: filters }
    ),

  /** GET /api/v1/admin/referrals/withdrawal-requests/:id → one request + context. */
  getPayoutRequestById: (id: string) =>
    api.get<ApiResponse<{ payoutRequest: AdminPayoutRequestDetail }>>(
      `/api/v1/admin/referrals/withdrawal-requests/${id}`
    ),

  /** PATCH .../:id/approve — no request body. Returns `data: {}`. */
  approvePayout: (id: string) =>
    api.patch<ApiResponse<Record<string, never>>>(
      `/api/v1/admin/referrals/withdrawal-requests/${id}/approve`
    ),

  /** PATCH .../:id/reject — `reason` is required; it is what the customer sees. */
  rejectPayout: (id: string, reason: string) =>
    api.patch<ApiResponse<Record<string, never>>>(
      `/api/v1/admin/referrals/withdrawal-requests/${id}/reject`,
      { reason }
    ),
};