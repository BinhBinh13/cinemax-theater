import axiosClient from '@/shared/services/axiosClient'


function toFormData(payload) {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

export function getFoodDrinks() {
  return axiosClient.get('/api/v1/food-drinks')
}

export function getFoodDrinkById(id) {
  return axiosClient.get(`/api/v1/food-drinks/${id}`)
}

export function createFoodDrink(payload) {
  return axiosClient.post('/api/v1/food-drinks', toFormData(payload))
}

export function updateFoodDrink(id, payload) {
  return axiosClient.put(`/api/v1/food-drinks/${id}`, toFormData(payload))
}

export function deleteFoodDrink(id) {
  return axiosClient.delete(`/api/v1/food-drinks/${id}`)
}
