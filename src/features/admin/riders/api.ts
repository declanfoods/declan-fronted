import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';

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

export interface StudentInfo {
  institution?: string;
  faculty?: string;
  department?: string;
  level?: string;
  matricNumber?: string;
  studentIdUrl?: string;
  [key: string]: unknown;
}

export interface EmergencyContact {
  contactName: string;
  phoneNumber: string;
  relationship: string;
  address: string;
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
  dateOfBirth: string;
  gender: string;
  state: string;
  lga: string;
  nearestLandmark: string;
  emergencyContact: EmergencyContact;
  [key: string]: unknown;
}

export const adminRiderApi = {
  getDeliveryRiders: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ riders: DeliveryRider[] } | DeliveryRider[]>>(
      '/api/v1/admin/delivery-riders',
      { signal },
    ),

  createDeliveryRider: (data: CreateDeliveryRiderPayload) =>
    api.post<ApiResponse<{ deliveryRider: DeliveryRider }>>(
      '/api/v1/admin/delivery-riders',
      data
    ),

  suspendRider: (riderId: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/delivery-riders/${riderId}/suspend`
    ),

  removeSuspension: (riderId: string) =>
    api.patch<ApiResponse<unknown>>(
      `/api/v1/admin/delivery-riders/${riderId}/remove-suspension`
    ),
};
