import api from './axios';

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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export const addressApi = {
  getAddresses: () =>
    api.get<ApiResponse<{ deliveryAddresses: DeliveryAddress[] }>>(
      '/api/v1/delivery-addresses'
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