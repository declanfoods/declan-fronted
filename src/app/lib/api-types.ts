/*
|--------------------------------------------------------------------------
| Shared API envelope + pagination
|--------------------------------------------------------------------------
| Every response from the Declan Foods backend is wrapped in this envelope:
|   { success, message, statusCode, timestamp, data }
|
| This file exists so we stop redeclaring `ApiResponse<T>` in 30 different
| api modules (which is what caused the duplicate-identifier build error
| in referralApi.ts).
*/

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export interface ApiPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Extracts a human-readable message out of an unknown thrown value.
 * Axios errors carry the backend envelope in `response.data.message`.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.length > 0) return message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
