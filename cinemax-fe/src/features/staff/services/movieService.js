import axiosClient from '@/shared/services/axiosClient'


function toMovieViewModel(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster: movie.posterUrl,
    duration: movie.durationMinutes,
    screeningStart: movie.releaseDate,
    screeningEnd: movie.endDate,
    status: movie.status,
    hasSchedules: movie.hasSchedules,
  }
}

export async function getMovies() {
  const response = await axiosClient.get('/api/v1/movies')
  return response.data.map(toMovieViewModel)
}

export async function getMovieById(movieId) {
  const response = await axiosClient.get(`/api/v1/movies/${movieId}`)
  return toMovieViewModel(response.data)
}

export async function getMovieRaw(movieId) {
  const response = await axiosClient.get(`/api/v1/movies/${movieId}`)
  return response.data
}


export function getScheduleByMovieId(movieId) {
 return axiosClient.get('/api/v1/schedules', { params: { movieId } })
}

export function getScheduleById(scheduleId) {
  return axiosClient.get(`/api/v1/schedules/${scheduleId}`)
}

export function createSchedule(payload) {
  return axiosClient.post('/api/v1/schedules', payload)
}

export function updateSchedule(scheduleId, payload) {
  return axiosClient.put(`/api/v1/schedules/${scheduleId}`, payload)
}

export function getAvailableRooms(movieId, date, startTime, excludeScheduleId) {
  return axiosClient.get('/api/v1/schedules/available-rooms', {
    params: { movieId, date, startTime, excludeScheduleId },
  })
}

export function deleteSchedule(scheduleId) {
  return axiosClient.delete(`/api/v1/schedules/${scheduleId}`)
}


export function createMovie(payload) {
  return axiosClient.post('/api/v1/movies', payload)
}

export function updateMovie(movieId, payload) {
  return axiosClient.put(`/api/v1/movies/${movieId}`, payload)
}

export function deleteMovie(movieId) {
  return axiosClient.delete(`/api/v1/movies/${movieId}`)
}
