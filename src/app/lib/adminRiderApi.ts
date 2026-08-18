import api from './axios';

export interface StudentInfo {
  institution?: string;
  faculty?: string;
  department?: string;
  level?: string;
  matricNumber?: string;
  studentIdUrl?: string;
  [key: string]: unknown;
}

export interface DeliveryRider {
  id: string;
  email: string;
  fullname: string;
  phoneNumberOne: string;
  phoneNumberTwo?: string | null;
  address: string;
  isStudent: boolean;
  studentInformation: StudentInfo | null;
  profilePictureUrl: string;
  isSuspended?: boolean;
  isOnline?: boolean;
  status?: string;
  activeOrders?: number;
  rating?: number;
  zone?: string;
  [key: string]: unknown;
}

export interface CreateDeliveryRiderPayload {
  fullname: string;
  email: string;
  phoneNumberOne: string;
  phoneNumberTwo?: string;
  address: string;
  isStudent: boolean;
  studentInfo?: StudentInfo;
  profilePictureUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const adminRiderApi = {
  getDeliveryRiders: () =>
    api.get<ApiResponse<{ deliveryRiders: DeliveryRider[] } | DeliveryRider[]>>(
      '/api/v1/admin/delivery-riders'
    ),

  createDeliveryRider: (data: CreateDeliveryRiderPayload) =>
    api.post<ApiResponse<{ deliveryRider: DeliveryRider }>>(
      '/api/v1/admin/delivery-riders',
      data
    ),

  getRiderDeliveries: (riderId: string) =>
    api.get<ApiResponse<unknown>>(`/api/v1/admin/delivery-riders/${riderId}/deliveries`),

  suspendRider: (riderId: string) =>
    api.patch<ApiResponse<unknown>>(`/api/v1/admin/delivery-riders/${riderId}/suspend`),

  removeSuspension: (riderId: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/delivery-riders/${riderId}/remove-suspension`
    ),
};

// Normalizes either { deliveryRiders: [...] } or a bare array response shape.
export function extractRidersList(
  data: { deliveryRiders: DeliveryRider[] } | DeliveryRider[]
): DeliveryRider[] {
  return Array.isArray(data) ? data : data.deliveryRiders;
}
