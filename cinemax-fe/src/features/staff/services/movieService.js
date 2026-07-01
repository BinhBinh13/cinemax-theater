import axiosClient from '@/shared/services/axiosClient'

// Movie catalog: real API (fu.se.cinemaxtheaterbe, /api/v1/movies).
// Unlike the Schedule functions below, these unwrap `.data` and remap field
// names here, because MovieCard/MovieGrid/MovieScheduleDetail already expect
// the old mock shape (poster, duration, screeningStart, screeningEnd).
function toMovieViewModel(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster: movie.posterUrl,
    duration: movie.durationMinutes,
    screeningStart: movie.releaseDate,
    screeningEnd: movie.endDate,
    status: movie.status,
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

export function deleteSchedule(scheduleId) {
  return axiosClient.delete(`/api/v1/schedules/${scheduleId}`)
}
