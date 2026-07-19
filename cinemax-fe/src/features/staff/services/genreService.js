import axiosClient from '@/shared/services/axiosClient'

export function getGenres() {
  return axiosClient.get('/api/v1/genres')
}
