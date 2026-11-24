import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';


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

function toPaymentMethod(raw: Record<string, unknown>): AdminPaymentMethod {
  const active = raw.isActive ?? raw.active ?? raw.status;

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? raw.name ?? 'Untitled method'),
    description: String(raw.description ?? ''),
    isActive: typeof active === 'string'
      ? !['false', 'inactive', 'disabled', '0'].includes(active.trim().toLowerCase())
      : Boolean(active ?? true),
  };
}

export function extractPaymentMethods(data: unknown): AdminPaymentMethod[] {
  const envelope = data as Record<string, unknown> | null;
  const rows = Array.isArray(data)
    ? data
    : envelope?.paymentMethodds ?? envelope?.paymentMethods ?? envelope?.methods;
  if (!Array.isArray(rows)) return [];

  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map(toPaymentMethod)
    .filter((method) => method.id !== '');
}

export const adminPaymentApi = {
  /** GET /api/v1/admin/payments/payment-methods */
  getPaymentMethods: (signal?: AbortSignal) =>
    api.get<ApiResponse<unknown>>('/api/v1/admin/payments/payment-methods', { signal }),

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
