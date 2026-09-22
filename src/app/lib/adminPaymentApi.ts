import api from './axios';
import type { ApiResponse } from './api-types';


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

