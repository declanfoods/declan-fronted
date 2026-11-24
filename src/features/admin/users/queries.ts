import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { adminUserApi } from './api';
import type {
  AdminUpdateWalletBalanceRequest,
  AdminUserActivity,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserListItem,
  AdminUserMetrics,
  AdminUserOrder,
  AdminUserReferral,
  AdminUserReferralTransaction,
  AdminUserTransaction,
  AdminUserWallet,
} from './api';
import type { ApiPagination } from '../../../app/lib/api-types';
import { adminUserKeys } from './queryKeys';

function wasParamRejection(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 400 || status === 422;
}

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery<{ users: AdminUserListItem[]; pagination: ApiPagination }, Error>({
    queryKey: adminUserKeys.list(filters),
    queryFn: async () => {
      try {
        const res = await adminUserApi.getUsers(filters);
        return res.data.data;
      } catch (error) {

        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.search || filters.status)
        );

        if (sentParams && wasParamRejection(error)) {
          console.warn(
            '[admin] GET /admin/users rejected our query params (HTTP ' +
              (error as { response?: { status?: number } })?.response?.status +
              '). Retrying without them — pagination and search will be handled client-side. ' +
              'Report this to the backend team.'
          );

          const fallback = await adminUserApi.getUsers();
          return fallback.data.data;
        }

        throw error;
      }
    },

    placeholderData: (previous) => previous,
  });
}

export function useAdminUserMetrics(): UseQueryResult<AdminUserMetrics, Error> {
  return useQuery({
    queryKey: adminUserKeys.metrics,
    queryFn: async () => {
      const res = await adminUserApi.getUserMetrics();
      return res.data.data;
    },
  });
}

export function useAdminUser(id?: string): UseQueryResult<AdminUserDetail, Error> {
  return useQuery({
    queryKey: adminUserKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserById(id as string);
      return res.data.data.user;
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserOrders(id?: string) {
  return useQuery<AdminUserOrder[], Error>({
    queryKey: adminUserKeys.orders(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserOrders(id as string);
      return res.data.data.orders;
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserActivities(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<{ activities: AdminUserActivity[]; pagination: ApiPagination }, Error>({
    queryKey: adminUserKeys.activities(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserActivities(id as string, filters);
      return res.data.data;
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserTransactions(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<{ transactions: AdminUserTransaction[]; pagination: ApiPagination }, Error>({
    queryKey: adminUserKeys.transactions(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserTransactions(id as string, filters);
      return res.data.data;
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserWallet(id?: string): UseQueryResult<AdminUserWallet, Error> {
  return useQuery({
    queryKey: adminUserKeys.wallet(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserWallet(id as string);
      return res.data.data.wallet;
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserReferrals(id?: string) {
  return useQuery<AdminUserReferral[], Error>({
    queryKey: adminUserKeys.referrals(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserReferrals(id as string);
      const payload = res.data.data as {
        referral?: AdminUserReferral[];
        referrals?: AdminUserReferral[];
      };

      return payload.referral ?? payload.referrals ?? [];
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserReferralTransactions(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<
    { transactions: AdminUserReferralTransaction[]; pagination: ApiPagination },
    Error
  >({
    queryKey: adminUserKeys.referralTransactions(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserReferralTransactions(id as string, filters);
      const payload = res.data.data as {
        referral_transactions?: AdminUserReferralTransaction[];
        referralTransactions?: AdminUserReferralTransaction[];
        pagination: ApiPagination;
      };

      return {
        transactions:
          payload.referral_transactions ?? payload.referralTransactions ?? [],
        pagination: payload.pagination,
      };
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
}

export function useSuspendUser() {
  return useMutation({
    mutationFn: adminUserApi.suspendUser,
    onSuccess: useInvalidateUsers(),
  });
}

export function useToggleReferralPrivileges() {
  return useMutation({
    mutationFn: ({ userId, enable }: { userId: string; enable: boolean }) =>
      enable
        ? adminUserApi.enableReferralPrivileges(userId)
        : adminUserApi.disableReferralPrivileges(userId),
    onSuccess: useInvalidateUsers(),
  });
}

export function useUpdateWalletBalance() {
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: AdminUpdateWalletBalanceRequest }) =>
      adminUserApi.updateWalletBalance(userId, body),
    onSuccess: useInvalidateUsers(),
  });
}

export function useUnsuspendUser() {
  return useMutation({
    mutationFn: adminUserApi.unsuspendUser,
    onSuccess: useInvalidateUsers(),
  });
}

export function useVerifyUser() {
  return useMutation({
    mutationFn: adminUserApi.verifyUser,
    onSuccess: useInvalidateUsers(),
  });
}
