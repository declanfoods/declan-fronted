import api from './axios';
import type { ApiResponse } from './api-types';

/*
|==========================================================================
| Admin dashboard overview
|==========================================================================
|
| GET /api/v1/admin/dashboard/overview
|
| ⚠️ THE PATH IS NOT IN THE POSTMAN COLLECTION.
|
| The collection's "Admin > Dashboard > Get Dashboard Overview" item has a
| saved 200 response but an EMPTY request URL — the author never filled it in,
| so the docs cannot tell you where this lives. The path above was found by
| probing the live server:
|
|     GET /api/v1/admin/dashboard/overview   → 401  (route exists)
|     GET /api/v1/admin/dashboard            → 404
|     GET /api/v1/admin/overview             → 404
|     GET /api/v1/admin/dashboard/metrics    → 404
|     GET /api/v1/admin/reports/overview     → 404
|
| 401 means the auth guard ran, so the route is real. Worth confirming with
| the backend dev, but the shape of the 401 (guard, not "Cannot GET") is the
| same signal that correctly identified every other route in this app.
|
| ---------------------------------------------------------------------------
| WHAT IT RETURNS — five keys, and only five
| ---------------------------------------------------------------------------
|   revenueInsight  { todayRevenue, yesterdaySameTimeRevenue,
|                     changePercentage|null, direction }
|   peakHours       { peakStartHour, peakEndHour, description }
|   lowStockAlerts  [ { productId, productName, quantityLeft } ]
|   topProducts     [ { itemId, name, imageUrls[], totalSold, totalRevenue } ]
|   topFoodPacks    [ same shape as topProducts ]
|
| THERE IS NO ACTIVITY FEED. The dashboard screen had a hardcoded "Recent
| Activity" list ("Order #DF-899 delivered 1hr ago" and so on) and this
| response has nothing behind it — no events array, no recentOrders, nothing.
| That section has been removed rather than left standing as fiction on an
| otherwise real page. See the note in AdminDashboard.tsx.
*/

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

/** One entry in either dashboard leaderboard. */
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
  /** GET /api/v1/admin/dashboard/overview */
  getOverview: () =>
    api.get<ApiResponse<AdminDashboardOverview>>(
      '/api/v1/admin/dashboard/overview'
    ),
};