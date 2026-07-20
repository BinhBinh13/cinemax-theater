import axiosClient from './axiosClient'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return axiosClient.post('/api/v1/uploads', formData)
}
