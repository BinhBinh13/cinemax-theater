import axiosClient from '@/shared/services/axiosClient'

export function getRooms() {
  return axiosClient.get('/api/v1/rooms')
}

export function getRoomById(id) {
  return axiosClient.get(`/api/v1/rooms/${id}`)
}

export function getRoomDetail(id) {
  return axiosClient.get(`/api/v1/rooms/${id}/detail`)
}

export function createRoom(payload) {
  return axiosClient.post('/api/v1/rooms', payload)
}

export function updateRoom(id, payload) {
  return axiosClient.put(`/api/v1/rooms/${id}`, payload)
}

export function deleteRoom(id) {
  return axiosClient.delete(`/api/v1/rooms/${id}`)
}

export function updateSeatType(seatId, seatType) {
  return axiosClient.put(`/api/v1/rooms/seats/${seatId}/type`, { seatType })
}

export function updateSeatStatus(seatId, status) {
  return axiosClient.put(`/api/v1/rooms/seats/${seatId}/status`, { status })
}
