import api from './axios';

// ─── Response types ───────────────────────────────────────

export interface ProfilePhoto {
  id: string;
  url: string;
}



export interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    profilePhoto: ProfilePhoto | null;
  };
  deliveryAddresses: DeliveryAddress[];
}

export interface UserMetrics {
  totalOrders: number;
  totalSpent: string;
  totalNumberOfDirectReferrals: number;
  cashback: string;
}

export interface RewardsMetrics {
  availableCashback: string;
  amountPaidThisMonth: string;
  monthlyTarget: string;
  amountToGo: string;
  cashbackRate: string;
  totalAmountPaidAllTime: string;
}

export interface OrderOverview {
  id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: 'PENDING' | 'PREPARING' | 'PACKED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  totalQuantityOfItems: number;
}

export interface ReferralPerson {
  firstName: string;
  lastName: string;
  dateJoined: string;
  numberOfDeliveredOrders: number;
  totalAmountOfDeliveredOrders: string;
}

export interface ReferralsMetrics {
  referralCode: string;
  totalDirectReferrals: number;
  totalActiveReferrals: number;
  referrals: ReferralPerson[];
}


export interface DeliveryAddress {
  id: string;
  nameOfCustomer: string;
  addressLine: string;
  state: string;
  country: string;
  emailAddress: string
}

export interface GetDeliveryAddressResponse {
  deliveryAddresses: DeliveryAddress[]
}
// ─── Generic API wrapper ──────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

// ─── API calls ────────────────────────────────────────────

export const userApi = {
  getDeliveryAddresses: () => 
    api.get<ApiResponse<GetDeliveryAddressResponse>>('api/v1/delivery-addresses'),
  
 getProfileOverview: () =>
  api.get<ApiResponse<{ user: UserProfile }>>('/api/v1/users/profile-overview'),

  getMetricsOverview: () =>
    api.get<ApiResponse<{ metrics: UserMetrics }>>('/api/v1/users/metrics-overview'),

  getRewardsOverview: () =>
    api.get<ApiResponse<{ metrics: RewardsMetrics }>>('/api/v1/users/rewards-overview'),

  getOrdersOverview: () =>
    api.get<ApiResponse<{ orders: OrderOverview[] }>>('/api/v1/users/orders-overview'),

  getReferralsOverview: () =>
    api.get<ApiResponse<{ metrics: ReferralsMetrics }>>('/api/v1/users/referrals-overview'),
};