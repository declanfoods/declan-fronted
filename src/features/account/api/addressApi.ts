import api from '../../../app/lib/axios';
import type { ApiResponse } from '../../../app/lib/api-types';

export interface DeliveryAddress {
  id: string;
  nameOfCustomer: string;
  addressLine: string;
  state: string;
  country: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface AddressPayload {
  fullName: string;
  addressLine: string;
  state: string;
  country: string;
  phoneNumber: string;
  email: string;
}

export const addressApi = {
  getAddresses: (signal?: AbortSignal) =>
    api.get<ApiResponse<{ deliveryAddresses: DeliveryAddress[] }>>(
      '/api/v1/delivery-addresses',
      { signal },
    ),

  createAddress: (data: AddressPayload) =>
    api.post<ApiResponse<{ deliveryAddress: DeliveryAddress }>>(
      '/api/v1/delivery-addresses',
      data
    ),

  updateAddress: (id: string, data: Partial<AddressPayload>) =>
    api.patch<ApiResponse<{ deliveryAddress: DeliveryAddress }>>(
      `/api/v1/delivery-addresses/${id}`,
      data
    ),

  deleteAddress: (id: string) =>
    api.delete(`/api/v1/delivery-addresses/${id}`),
};
