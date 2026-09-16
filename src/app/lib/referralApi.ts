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
| Withdrawal request — POST /api/v1/referrals/withdraw
|--------------------------------------------------------------------------
| ⚠️ THIS ENDPOINT DOES NOT EXIST ON THE BACKEND YET.
|
| It is referenced here on purpose so the customer Withdraw screen is 100%
| finished on the frontend and starts working the moment the backend adds the
| route — no frontend change needed. Until then the call returns 404 and the
| screen shows an explicit "not live yet" message rather than faking success.
|
| The field names below are what I've asked the backend to implement (see the
| backend ticket). If the backend dev picks different names, change them here
| and nowhere else.
*/

export interface WithdrawalRequestPayload {
  /** Naira amount, e.g. 5000. Validate against availableBalance before sending. */
  amount: number;
  bankName: string;
  /** 10-digit NUBAN account number. */
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalRequestResult {
  id: string;
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: string;
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
   * POST /api/v1/referrals/withdraw
   *
   * ⚠️ Not implemented on the backend yet — returns 404 until it is.
   * The Withdraw screen detects the 404 and says so plainly instead of
   * pretending the request was accepted.
   */
  requestWithdrawal: (payload: WithdrawalRequestPayload) =>
    api.post<ApiResponse<WithdrawalRequestResult>>('/api/v1/referrals/withdraw', payload),
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
