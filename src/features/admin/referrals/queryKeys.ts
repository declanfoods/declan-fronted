import type { AdminReferralFilters, PayoutRequestFilters } from './api';

const all = ['admin', 'referrals'] as const;
const payouts = [...all, 'payouts'] as const;
const memberMetrics = (id: string) => [...all, 'users', id, 'metrics', {}] as const;

export const adminReferralKeys = {
  list: (filters?: AdminReferralFilters) => [...all, filters ?? {}] as const,
  metrics: [...all, 'metrics'] as const,
  memberMetrics,
  directReferrals: (id: string, filters?: { page?: number; limit?: number }) =>
    [...memberMetrics(id), 'direct', filters ?? {}] as const,
  payouts,
  payoutList: (filters?: PayoutRequestFilters) => [...payouts, filters ?? {}] as const,
  payout: (id: string) => [...payouts, id] as const,
  pendingPayout: [...payouts, 'pending-check'] as const,
  commissionConfig: ['admin', 'config', 'commission'] as const,
  referralConfig: ['admin', 'config', 'referral'] as const,
  withdrawalConfig: ['admin', 'config', 'withdrawal'] as const,
};
