import api from './axios';
import type { ApiResponse, ApiPagination } from './api-types';

/*
|--------------------------------------------------------------------------
| CUSTOMER REFERRAL API
|--------------------------------------------------------------------------
| ⚠️ WHAT WAS WRONG BEFORE
|
| This file had been appended to instead of edited. It contained:
|   - `import api from './axios'`  TWICE
|   - `interface ApiResponse<T>`  TWICE
|   - `export const referralApi = {…}`  TWICE
|
| Because the second `const referralApi` shadows the first, the *first*
| block (getReferralCode / getReferrals) was dead code, AND TypeScript
| refused to compile the whole project with:
|
|   referralApi.ts(1,8):  TS2300 Duplicate identifier 'api'.
|   referralApi.ts(26,14): TS2451 Cannot redeclare block-scoped variable 'referralApi'.
|   referralApi.ts(39,8):  TS2300 Duplicate identifier 'api'.
|   referralApi.ts(123,14): TS2451 Cannot redeclare block-scoped variable 'referralApi'.
|
| → `npm run build` failed. Nothing downstream could run.
|
| The old `referralApi.getReferralCode()` / `.getReferrals()` pair is kept
| below as thin aliases so the existing screens that still call them keep
| working while they migrate to the richer endpoints.
*/

// ─── Response types ─────────────────────────────────────────────────────

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

/**
 * Shape returned by GET /api/v1/referrals/:id (a member's downline).
 * Not fully documented by the backend yet — typed permissively on purpose,
 * see `getDownline` comment.
 */
export interface ReferralDownline {
  id: string;
  fullname: string;
  joinedAt: string;
  level: number;
  numberOfOrders: number;
  totalCommissionEarnedOnReferral: number;
  commissionEligibilityStatus: CommissionEligibilityStatus;
  downlines: ReferralDownline[];
}

/*
|--------------------------------------------------------------------------
| Withdrawal requests — the real endpoints (NEW, docs-verified)
|--------------------------------------------------------------------------
| The old code posted to `POST /api/v1/referrals/withdraw`, which never
| existed. The backend has since shipped a proper two-sided flow:
|
|   Customer  (folder: Referrals > Withdrawal Request)
|     POST   /api/v1/referrals/withdrawals/requests/initiate
|     POST   /api/v1/referrals/withdrawals/requests/:id/request-verification
|     GET    /api/v1/referrals/withdrawals/requests
|     PATCH  /api/v1/referrals/withdrawals/requests/:id/verify
|     PATCH  /api/v1/referrals/withdrawals/requests/:id/cancel-request
|
|   Admin     (folder: Admin Referrals > Referral Payout)
|     GET    /api/v1/admin/referrals/withdrawal-requests
|     GET    /api/v1/admin/referrals/withdrawal-requests/:id
|     PATCH  /api/v1/admin/referrals/withdrawal-requests/:id/approve
|     PATCH  /api/v1/admin/referrals/withdrawal-requests/:id/reject
|
| HOW THE FLOW WORKS (per the collection's saved responses):
|   1. Customer submits the form        → initiate        → UNVERIFIED / PENDING
|      The response says "Check email for verification code".
|   2. Customer types the emailed code  → verify          → VERIFIED  / PENDING
|   3. Admin approves or rejects        → approve/reject
|   4. Customer may cancel while PENDING → cancel-request → CANCELLED
|
| ⚠️ DATA QUIRKS — confirmed in the saved responses, do not "clean up":
|   • `amount` is a STRING ("2000.00") on every read endpoint, but a NUMBER
|     in the initiate request body and in the initiate RESPONSE (500).
|     Always read it through Number().
|   • Statuses are split across TWO independent fields:
|       verificationStatus: 'UNVERIFIED' | 'VERIFIED'
|       requestStatus:      'PENDING' | 'CANCELLED' | (approved/rejected TBD)
|     A request can be VERIFIED and still PENDING — they are not one field.
|   • The admin list calls the bank block `accountDetails`; the customer
|     list calls the same thing `bankDetails`. Normalised in `bankOf()`.
|   • The initiate endpoint returns HTTP 201 but the body's own `statusCode`
|     says 200. Trust the HTTP status, not the body field.
|   • `verifiedAt` / `approvedAt` come back as null even when the request is
|     already VERIFIED in the same payload. Treat them as best-effort.
*/

export type PayoutVerificationStatus = 'UNVERIFIED' | 'VERIFIED';
export type PayoutRequestStatus = 'PENDING' | 'CANCELLED' | 'APPROVED' | 'REJECTED';

/** Bank block. The API returns this under two different key names. */
export interface PayoutBankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
}

/**
 * Accepts either key name and always returns a bank block.
 * Admin list/detail → `accountDetails`; customer list → `bankDetails`.
 */
export function bankOf(request: {
  bankDetails?: PayoutBankDetails | null;
  accountDetails?: PayoutBankDetails | null;
}): PayoutBankDetails | null {
  return request.bankDetails ?? request.accountDetails ?? null;
}

/** One payout request as the CUSTOMER sees it. */
export interface PayoutRequest {
  id: string;
  /** String on reads ("500.00"), number on the initiate response (500). */
  amount: string | number;
  verificationStatus: PayoutVerificationStatus;
  requestStatus: PayoutRequestStatus;
  /** Present on the customer endpoints. */
  bankDetails?: PayoutBankDetails;
  createdAt: string;
  verifiedAt?: string | null;
  approvedAt?: string | null;
}

/** Body for POST /referrals/withdrawals/requests/initiate. */
export interface InitiateWithdrawalPayload {
  /** Number, not string — matches the collection's example body. */
  amount: number;
  accountName: string;
  /** 10-digit NUBAN. */
  accountNumber: string;
  bankName: string;
}

export interface WithdrawalRequestsPage {
  payoutRequests: PayoutRequest[];
  pagination: ApiPagination;
}

// ─── Endpoints ──────────────────────────────────────────────────────────

export const referralApi = {
  /** GET /api/v1/referrals/code → the signed-in user's own referral code. */
  getCode: () => api.get<ApiResponse<ReferralCodeData>>('/api/v1/referrals/code'),

  /** GET /api/v1/referrals/wallet → balance / pending / lifetime earned. */
  getWallet: () =>
    api.get<ApiResponse<{ referralWallet: ReferralWallet }>>('/api/v1/referrals/wallet'),

  /** GET /api/v1/referrals/history → paginated credit/debit ledger. */
  getHistory: (filters?: ReferralFilters) =>
    api.get<
      ApiResponse<{ history: ReferralHistoryItem[]; pagination: ApiPagination }>
    >('/api/v1/referrals/history', { params: filters }),

  /** GET /api/v1/referrals/networks → level-1 (direct) referrals, paginated. */
  getNetworks: (filters?: ReferralFilters) =>
    api.get<ApiResponse<{ referrals: DirectReferral[]; pagination: ApiPagination }>>(
      '/api/v1/referrals/networks',
      { params: filters }
    ),

  /**
   * GET /api/v1/referrals/:id → one member's own downline, recursively.
   *
   * NOTE: the backend response shape is not documented yet. It is typed as
   * `ReferralDownline` based on what the admin equivalent returns; if the
   * payload turns out flat, adjust the interface, not the screens.
   */
  getDownline: (id: string) =>
    api.get<ApiResponse<ReferralDownline>>(`/api/v1/referrals/${id}`),

  /** GET /api/v1/referrals/metrics → network size, qualified count, per-level earnings. */
  getMetrics: () =>
    api.get<ApiResponse<{ metrics: ReferralMetrics }>>('/api/v1/referrals/metrics'),

  /**
   * POST /api/v1/referrals/withdrawals/requests/initiate
   *
   * Step 1 of the withdrawal flow. Returns the created request plus the
   * message "Successfully initiated payout. Check email for verification code".
   * HTTP 201.
   */
  initiateWithdrawal: (payload: InitiateWithdrawalPayload) =>
    api.post<ApiResponse<{ payoutRequest: PayoutRequest }>>(
      '/api/v1/referrals/withdrawals/requests/initiate',
      payload
    ),

  /**
   * POST /api/v1/referrals/withdrawals/requests/:id/request-verification
   *
   * Re-sends the emailed verification code. Use when the customer says the
   * code never arrived — it does NOT create a second request.
   * HTTP 201.
   */
  requestWithdrawalVerification: (id: string) =>
    api.post<ApiResponse<{ payoutRequest: PayoutRequest }>>(
      `/api/v1/referrals/withdrawals/requests/${id}/request-verification`
    ),

  /** GET /api/v1/referrals/withdrawals/requests → the customer's own requests. */
  getWithdrawalRequests: (filters?: ReferralFilters) =>
    api.get<ApiResponse<WithdrawalRequestsPage>>(
      '/api/v1/referrals/withdrawals/requests',
      { params: filters }
    ),

  /**
   * PATCH /api/v1/referrals/withdrawals/requests/:id/verify
   *
   * Step 2. `verificationCode` is the code emailed by initiate. On success
   * `verificationStatus` flips to VERIFIED while `requestStatus` stays PENDING
   * — the request now sits in the admin payout queue awaiting approval.
   */
  verifyWithdrawal: (id: string, verificationCode: string) =>
    api.patch<ApiResponse<{ payoutRequest: PayoutRequest }>>(
      `/api/v1/referrals/withdrawals/requests/${id}/verify`,
      { verificationCode }
    ),

  /**
   * PATCH /api/v1/referrals/withdrawals/requests/:id/cancel-request
   *
   * Customer withdraws their own request. Only meaningful while PENDING —
   * the UI hides it once a request is approved or rejected.
   */
  cancelWithdrawal: (id: string) =>
    api.patch<ApiResponse<{ payoutRequest: PayoutRequest }>>(
      `/api/v1/referrals/withdrawals/requests/${id}/cancel-request`
    ),
};

export default referralApi;

/*
|--------------------------------------------------------------------------
| Legacy aliases
|--------------------------------------------------------------------------
| The admin/customer screens written earlier call `getReferralCode()` and
| `getReferrals()`. They are mapped onto the real endpoints here rather than
| deleted, so migrating a screen is a one-file change and the build never
| goes red in between.
|
|   getReferralCode() → same call as getCode(), flattened to { referralCode }
|   getReferrals()    → same call as getNetworks(), mapped to the old
|                       { firstName, lastName, dateJoined, … } shape.
*/

export interface LegacyReferralPerson {
  firstName: string;
  lastName: string;
  dateJoined: string;
  numberOfDeliveredOrders: number;
  totalAmountOfDeliveredOrders: string;
}

function splitFullname(fullname: string): { firstName: string; lastName: string } {
  const parts = fullname.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

/** @deprecated use `referralApi.getCode()` */
export const getReferralCode = async () => {
  const res = await referralApi.getCode();
  const code = res.data.data?.code ?? '';

  return {
    ...res,
    data: { ...res.data, data: { referralCode: code } },
  };
};

/** @deprecated use `referralApi.getNetworks()` */
export const getReferrals = async () => {
  const res = await referralApi.getNetworks();
  const referrals: LegacyReferralPerson[] = (res.data.data?.referrals ?? []).map((r) => {
    const { firstName, lastName } = splitFullname(r.fullname);

    return {
      firstName,
      lastName,
      dateJoined: r.joinedAt,
      numberOfDeliveredOrders: r.numberOfOrders,
      totalAmountOfDeliveredOrders: String(r.totalCommissionEarnedOnReferral ?? 0),
    };
  });

  return {
    ...res,
    data: { ...res.data, data: { referrals } },
  };
};