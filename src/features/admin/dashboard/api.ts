import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';

/** Which way revenue moved against the same time yesterday. */
export type RevenueDirection = 'up' | 'down' | 'neutral';

export interface RevenueInsight {
  todayRevenue: number;
  yesterdaySameTimeRevenue: number;
  /**
   * null when there is no comparable figure for yesterday — which is "no
   * comparison available", NOT zero change. The card says so rather than
   * printing a misleading 0%.
   */
  changePercentage: number | null;
  direction: RevenueDirection;
}

export interface DashboardPeakHours {
  /** 0-23. */
  peakStartHour: number;
  peakEndHour: number;
  /** Server-written sentence, e.g. "Order volumes peak between 3 PM and 4 PM daily." */
  description: string;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  quantityLeft: number;
}

export interface DashboardTopItem {
  itemId: string;
  name: string;
  imageUrls: string[];
  totalSold: number;
  totalRevenue: number;
}

export interface AdminDashboardOverview {
  revenueInsight: RevenueInsight;
  peakHours: DashboardPeakHours;
  lowStockAlerts: LowStockAlert[];
  topProducts: DashboardTopItem[];
  topFoodPacks: DashboardTopItem[];
}

export const adminDashboardApi = {
  getOverview: (signal?: AbortSignal) =>
    api.get<ApiResponse<AdminDashboardOverview>>(
      '/api/v1/admin/dashboard/overview',
      { signal },
    ),
};
