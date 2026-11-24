export type PayoutVerificationStatus = 'UNVERIFIED' | 'VERIFIED';
export type PayoutRequestStatus = 'PENDING' | 'CANCELLED' | 'SUCCESSFUL' | 'REJECTED';

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

export function payoutStatusLabel(status: PayoutRequestStatus): string {
  const labels: Record<PayoutRequestStatus, string> = {
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    SUCCESSFUL: 'Approved',
    REJECTED: 'Rejected',
  };

  return labels[status] ?? status;
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  SUCCESSFUL: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REJECTED: 'bg-red-50 text-red-600',
};

export function payoutStatusTone(status: PayoutRequestStatus): string {
  return STATUS_TONE[status] ?? 'bg-gray-100 text-gray-500';
}
