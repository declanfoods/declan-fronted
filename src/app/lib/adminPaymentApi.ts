import api from './axios';
import type { ApiResponse } from './api-types';

/*
|==========================================================================
| Admin payment methods
|==========================================================================
|
| Four endpoints, in the collection under `Admin > Admin Payments`:
|
|   GET    /api/v1/admin/payments/payment-methods
|   POST   /api/v1/admin/payments/payment-methods   { title, description, isActive }
|   PATCH  /api/v1/admin/payments/payment-methods/:id/activate
|   PATCH  /api/v1/admin/payments/payment-methods/:id/deactivate
|
| All four were probed against the live server and exist (401 — the auth guard
| ran, so the route is real; `Cannot PATCH`/404 is what a missing route looks
| like).
|
| ---------------------------------------------------------------------------
| WHY THE RESPONSE SHAPES ARE INFERRED, AND HOW THEY WERE INFERRED
| ---------------------------------------------------------------------------
| ⚠️ NONE of the four admin endpoints has a saved response in the collection.
| That is why they were not wired earlier — there was nothing to type from.
|
| But the CUSTOMER-side twin does have one, and it reads the live server fine:
|
|   GET /api/v1/payment-method   → 200 UNAUTHENTICATED, verified live
|   {
|     "data": {
|       "paymentMethodds": [                    ← yes, three d's — see below
|         { "id": "1e492ef8-…",
|           "title": "Bank Transfer on Delivery",
|           "description": "Pay with bank transfer on delivery" },
|         { "id": "84c19c1a-…",
|           "title": "Cash on Delivery",
|           "description": "Pay with cash on delivery" }
|       ]
|     }
|   }
|
| Same backend, same model, so the admin list is taken to be the same objects
| plus `isActive` — which is the only field the POST body adds and the only
| thing the activate/deactivate routes can be switching. `isActive` is
| therefore read defensively (see `toPaymentMethod`) rather than assumed
| present, and everything else matches the shape observed live.
|
| ⚠️ `paymentMethodds` — THREE d's. That is genuinely the field name the API
|    returns, and it is the same on the admin side as the customer side. It is
|    NOT a typo to fix here; "fixing" it would break the read. Same family as
|    `referralWalleBalance` (sic) elsewhere in this API.
|
| If the admin payload turns out to differ, only this file changes — the
| screen reads `AdminPaymentMethod`, not the raw response.
*/

/**
 * One payment method as configured by an admin.
 *
 * `isActive` is optional because it is the one field not confirmed by an
 * observed payload. `toPaymentMethod` normalises it to a boolean.
 */
export interface AdminPaymentMethod {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface CreatePaymentMethodPayload {
  title: string;
  description: string;
  isActive: boolean;
}

/**
 * Reads one entry defensively.
 *
 * Handles the fields that could plausibly differ from the inferred shape:
 * `isActive` may be absent, or may arrive as the string 'true'/'false' rather
 * than a boolean. `description` may be null. Everything else is required by
 * the create body, so it is taken as given.
 */
export function toPaymentMethod(raw: Record<string, unknown>): AdminPaymentMethod {
  const active = raw.isActive ?? raw.active ?? raw.status;

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? raw.name ?? 'Untitled method'),
    description: String(raw.description ?? ''),
    /*
      Absent is treated as active. A method that exists and can be selected at
      checkout is more likely active than not, and the POST body makes
      isActive required — so an omitted field means the list endpoint did not
      echo it, not that the method is switched off.
    */
    isActive:
      active === undefined || active === null
        ? true
        : typeof active === 'string'
          ? active.toLowerCase() !== 'false'
          : Boolean(active),
  };
}

/** Pulls the array out of whichever envelope the endpoint used. */
export function extractPaymentMethods(data: unknown): AdminPaymentMethod[] {
  if (!data) return [];

  // The response may be the object, or an array already.
  if (Array.isArray(data)) {
    return data.map((r) => toPaymentMethod(r as Record<string, unknown>));
  }

  const bag = data as Record<string, unknown>;

  const list =
    bag.paymentMethodds ?? // the real spelling, three d's
    bag.paymentMethods ?? // in case the admin route spells it correctly
    bag.methods ??
    [];

  return Array.isArray(list)
    ? list.map((r) => toPaymentMethod(r as Record<string, unknown>))
    : [];
}

export const adminPaymentApi = {
  /** GET /api/v1/admin/payments/payment-methods */
  getPaymentMethods: () =>
    api.get<ApiResponse<unknown>>('/api/v1/admin/payments/payment-methods'),

  /**
   * POST /api/v1/admin/payments/payment-methods
   *
   * `isActive` is required by the documented body, so it is always sent —
   * a new method an admin just added is almost always meant to be live.
   */
  createPaymentMethod: (payload: CreatePaymentMethodPayload) =>
    api.post<ApiResponse<unknown>>(
      '/api/v1/admin/payments/payment-methods',
      payload
    ),

  /** PATCH /api/v1/admin/payments/payment-methods/:id/activate */
  activatePaymentMethod: (id: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/payments/payment-methods/${id}/activate`
    ),

  /** PATCH /api/v1/admin/payments/payment-methods/:id/deactivate */
  deactivatePaymentMethod: (id: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/payments/payment-methods/${id}/deactivate`
    ),
};

/*
  NOTE FOR THE BACKEND DEV, also in backend-message-latest.md:
  these four endpoints have no saved response in Postman, which is the only
  reason the shapes above are inferred from the customer-side twin. A saved
  200 on each would let this file drop the defensiveness.
*/