import axiosClient from './axiosClient'

export async function getRoomSeats(roomId) {
  const response = await axiosClient.get(`/api/v1/rooms/${roomId}/seats`)
  return response.data
}

export async function getOccupiedSeats(scheduleId) {
  const response = await axiosClient.get(`/api/v1/schedules/${scheduleId}/occupied-seats`)
  return response.data
}

export async function createBooking(scheduleId, seatIds, paymentMethod = 'CASH') {
  const response = await axiosClient.post('/api/v1/bookings', {
    scheduleId,
    seatIds,
    paymentMethod,
  })
  return response.data
}

export async function getBookingHistory() {
  const response = await axiosClient.get('/api/v1/bookings/history')
  return response.data
}
