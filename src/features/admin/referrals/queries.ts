import { useQuery } from '@tanstack/react-query';
import type { ApiPagination } from '../../../app/lib/api-types';
import {
  adminReferralApi,
  type AdminReferralFilters,
  type AdminReferralListItem,
  type AdminUserReferralSummary,
  type UserReferralMetricItem,
} from './api';
import { adminReferralKeys } from './queryKeys';

export function useAdminReferrals(filters?: AdminReferralFilters) {
  return useQuery<{ referrals: AdminReferralListItem[]; pagination: ApiPagination }, Error>({
    queryKey: adminReferralKeys.list(filters),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getReferrals(filters);
        return res.data.data;
      } catch (error) {

        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.level)
        );

        if (sentParams && (status === 400 || status === 422)) {

          console.warn(
            '[admin] GET /admin/referrals rejected our query params (HTTP ' +
              status +
              '). Retrying without them.'
          );

          const fallback = await adminReferralApi.getReferrals();
          return fallback.data.data;
        }

        throw error;
      }
    },
    placeholderData: (previous) => previous,
  });
}

export const useAdminReferralMetrics = () => {
  return useQuery({
    queryKey: adminReferralKeys.metrics,
    queryFn: () =>
      adminReferralApi.getReferralsMetrics().then((res) => res.data.data),
  });
};

export function useUserReferralMetrics(userId?: string) {
  return useQuery<AdminUserReferralSummary, Error>({
    queryKey: adminReferralKeys.memberMetrics(userId ?? ''),
    queryFn: async () => {
      const res = await adminReferralApi.getUserReferralMetrics(userId as string);
      return res.data.data.referral;
    },
    enabled: Boolean(userId),
  });
}

export function useUserDirectReferrals(
  userId?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<
    { referrals: UserReferralMetricItem[]; pagination: ApiPagination },
    Error
  >({
    queryKey: adminReferralKeys.directReferrals(userId ?? '', filters),
    queryFn: async () => {
      try {
        const res = await adminReferralApi.getUserDirectReferrals(userId as string, filters);
        return res.data.data;
      } catch (error) {

        const status = (error as { response?: { status?: number } })?.response?.status;
        const sentParams = Boolean(filters && (filters.page || filters.limit));

        if (status === 400 || status === 422) {
          if (sentParams) {
            console.warn(
              '[admin] direct-referrals rejected our query params (HTTP ' +
                status +
                '). Retrying without them — report this to the backend team.'
            );
          }

          const fallback = await adminReferralApi.getUserDirectReferrals(userId as string);
          return fallback.data.data;
        }

        throw error;
      }
    },
    enabled: Boolean(userId),
    placeholderData: (previous) => previous,
  });
}
