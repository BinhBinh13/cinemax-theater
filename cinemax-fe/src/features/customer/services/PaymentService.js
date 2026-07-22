import axiosClient from '@/shared/services/axiosClient';

export async function verifyPayment(params) {
  const response = await axiosClient.get('/api/v1/bookings/verify-payment', { params });
  return response.data;
}
