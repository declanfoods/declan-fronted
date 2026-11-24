import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  adminReferralApi,
  type FullCommissionConfigResponse,
  type ReferralProgramConfig,
  type UpdateCashbackPayload,
  type UpdateCommissionPayload,
  type UpdateReferralProgramPayload,
  type UpdateWalletPayload,
  type UpdateWithdrawalPayload,
  type WithdrawalConfig,
} from './api';
import { adminReferralKeys } from './queryKeys';

export function useCommissionConfig(): UseQueryResult<FullCommissionConfigResponse, Error> {
  return useQuery({
    queryKey: adminReferralKeys.commissionConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getCommissionConfig();
      return res.data.data;
    },
  });
}

export function useUpdateCommissionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommissionPayload) =>
      adminReferralApi.updateCommissionConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminReferralKeys.commissionConfig }),
  });
}

export function useUpdateCashbackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCashbackPayload) =>
      adminReferralApi.updateCashbackConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminReferralKeys.commissionConfig }),
  });
}

export function useUpdateWalletConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWalletPayload) =>
      adminReferralApi.updateWalletConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminReferralKeys.commissionConfig }),
  });
}

export function useReferralConfig(): UseQueryResult<ReferralProgramConfig, Error> {
  return useQuery({
    queryKey: adminReferralKeys.referralConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getReferralConfig();
      return res.data.data;
    },
  });
}

export function useUpdateReferralConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReferralProgramPayload) =>
      adminReferralApi.updateReferralConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminReferralKeys.referralConfig }),
  });
}

// ─── Config: withdrawals ────────────────────────────────────────────────

export function useWithdrawalConfig(): UseQueryResult<WithdrawalConfig, Error> {
  return useQuery({
    queryKey: adminReferralKeys.withdrawalConfig,
    queryFn: async () => {
      const res = await adminReferralApi.getWithdrawalConfig();
      return res.data.data;
    },
  });
}

export function useUpdateWithdrawalConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWithdrawalPayload) =>
      adminReferralApi.updateWithdrawalConfig(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminReferralKeys.withdrawalConfig }),
  });
}
