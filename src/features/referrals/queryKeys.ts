import type { ReferralFilters } from './api';

const all = ['customer', 'referrals'] as const;
const history = [...all, 'history'] as const;
const tree = [...all, 'tree'] as const;
const withdrawals = [...all, 'withdrawal-requests'] as const;

export const referralKeys = {
  code: [...all, 'code'] as const,
  wallet: [...all, 'wallet'] as const,
  metrics: [...all, 'metrics'] as const,
  networks: (filters?: ReferralFilters) => [...all, 'networks', filters ?? {}] as const,
  history,
  historyPage: (filters?: ReferralFilters) => [...history, filters ?? {}] as const,
  tree,
  treeLevel: (level: number, filters?: ReferralFilters) => [...tree, level, filters ?? {}] as const,
  withdrawals,
  withdrawalPage: (filters?: ReferralFilters) => [...withdrawals, filters ?? {}] as const,
};
