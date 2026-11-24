import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiPagination } from '../../app/lib/api-types';
import {
  referralApi,
  type DirectReferral,
  type ReferralCodeData,
  type ReferralFilters,
  type ReferralHistoryItem,
  type ReferralMetrics,
  type ReferralTree,
  type ReferralTreeLevelData,
  type ReferralWallet,
} from './api';
import { referralKeys } from './queryKeys';

export function useReferralCode(): UseQueryResult<ReferralCodeData, Error> {
  return useQuery({
    queryKey: referralKeys.code,
    queryFn: async () => {
      const res = await referralApi.getCode();
      return res.data.data;
    },
    // A referral code never changes for a user — cache it hard.
    staleTime: 30 * 60_000,
  });
}

export function useReferralWallet(): UseQueryResult<ReferralWallet, Error> {
  return useQuery({
    queryKey: referralKeys.wallet,
    queryFn: async () => {
      const res = await referralApi.getWallet();
      return res.data.data.referralWallet;
    },
  });
}

export function useReferralMetrics(): UseQueryResult<ReferralMetrics, Error> {
  return useQuery({
    queryKey: referralKeys.metrics,
    queryFn: async () => {
      const res = await referralApi.getMetrics();
      return res.data.data.metrics;
    },
  });
}

export function useReferralNetworks(filters?: ReferralFilters) {
  return useQuery<{ referrals: DirectReferral[]; pagination: ApiPagination }, Error>({
    queryKey: referralKeys.networks(filters),
    queryFn: async () => {
      const res = await referralApi.getNetworks(filters);
      return res.data.data;
    },
    placeholderData: (previous) => previous,
  });
}


export function useReferralTree(): UseQueryResult<ReferralTree, Error> {
  return useQuery<ReferralTree, Error>({
    queryKey: referralKeys.tree,
    queryFn: async () => {
      const res = await referralApi.getTree();
      return res.data.data;
    },
  });
}

export function useReferralsAtLevel(
  level: number,
  filters?: ReferralFilters
): UseQueryResult<ReferralTreeLevelData, Error> {
  return useQuery<ReferralTreeLevelData, Error>({
    queryKey: referralKeys.treeLevel(level, filters),
    queryFn: async () => {
      const res = await referralApi.getTreeLevel(level, filters);
      return res.data.data;
    },
    enabled: Number.isFinite(level) && level >= 1,
    placeholderData: (previous) => previous,
  });
}

export function useReferralHistory(filters?: ReferralFilters) {
  return useQuery<{ history: ReferralHistoryItem[]; pagination: ApiPagination }, Error>({
    queryKey: referralKeys.historyPage(filters),
    queryFn: async () => {
      const res = await referralApi.getHistory(filters);
      return res.data.data;
    },
    placeholderData: (previous) => previous,
  });
}
