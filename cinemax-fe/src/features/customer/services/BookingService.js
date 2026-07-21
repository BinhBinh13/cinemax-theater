import axiosClient from '@/shared/services/axiosClient';

export async function getScheduleSeats(scheduleId) {
  const response = await axiosClient.get(`/api/v1/bookings/schedules/${scheduleId}/seats`);
  return response.data;
}

export async function getFoodDrinks() {
  const response = await axiosClient.get('/api/v1/food-drinks');
  return response.data;
}

export async function createBooking(payload) {
  const response = await axiosClient.post('/api/v1/bookings', payload);
  return response.data;
}

export async function verifyPayment(params) {
  const response = await axiosClient.get('/api/v1/bookings/verify-payment', { params });
  return response.data;
}

export async function getScheduleById(scheduleId) {
  const response = await axiosClient.get(`/api/v1/schedules/${scheduleId}`);
  return response.data;
}
