import type { AdminUserFilters } from './api';

const all = ['admin', 'users'] as const;
const detail = (id: string) => [...all, id] as const;
type PageFilters = { page?: number; limit?: number };

export const adminUserKeys = {
  all,
  list: (filters?: AdminUserFilters) => [...all, filters ?? {}] as const,
  metrics: [...all, 'metrics'] as const,
  detail,
  orders: (id: string) => [...detail(id), 'orders'] as const,
  activities: (id: string, filters?: PageFilters) =>
    [...detail(id), 'activities', filters ?? {}] as const,
  transactions: (id: string, filters?: PageFilters) =>
    [...detail(id), 'transactions', filters ?? {}] as const,
  wallet: (id: string) => [...detail(id), 'wallet'] as const,
  referrals: (id: string) => [...detail(id), 'referrals'] as const,
  referralTransactions: (id: string, filters?: PageFilters) =>
    [...detail(id), 'referral-transactions', filters ?? {}] as const,
};
