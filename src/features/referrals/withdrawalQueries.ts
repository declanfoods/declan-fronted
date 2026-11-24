import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referralApi, type InitiateWithdrawalPayload, type ReferralFilters } from './api';
import { referralKeys } from './queryKeys';

function useInvalidateWithdrawal() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: referralKeys.withdrawals }),
    client.invalidateQueries({ queryKey: referralKeys.wallet }),
    client.invalidateQueries({ queryKey: referralKeys.history }),
  ]);
}

export function useInitiateWithdrawal() {
  return useMutation({
    mutationFn: (payload: InitiateWithdrawalPayload) => referralApi.initiateWithdrawal(payload),
    onSuccess: useInvalidateWithdrawal(),
  });
}

export function useVerifyWithdrawal() {
  return useMutation({
    mutationFn: ({ id, verificationCode }: { id: string; verificationCode: string }) =>
      referralApi.verifyWithdrawal(id, verificationCode),
    onSuccess: useInvalidateWithdrawal(),
  });
}

export function useResendWithdrawalCode() {
  return useMutation({ mutationFn: referralApi.requestWithdrawalVerification });
}

export function useCancelWithdrawal() {
  return useMutation({
    mutationFn: referralApi.cancelWithdrawal,
    onSuccess: useInvalidateWithdrawal(),
  });
}

export function useWithdrawalRequests(filters?: ReferralFilters) {
  return useQuery({
    queryKey: referralKeys.withdrawalPage(filters),
    queryFn: async () => {
      const { data } = await referralApi.getWithdrawalRequests(filters);
      return data.data;
    },
  });
}
