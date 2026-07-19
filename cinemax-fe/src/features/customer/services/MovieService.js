import axiosClient from '@/shared/services/axiosClient'

function toMovieViewModel(movie) {
  if (!movie) return null;
  return {
    id: movie.id,
    title: movie.title,
    poster: movie.posterUrl,
    duration: movie.durationMinutes,
    screeningStart: movie.releaseDate,
    screeningEnd: movie.endDate,
    status: movie.status,
    language: movie.language,
    director: movie.director,
    actors: movie.cast, // map backend cast to frontend actors
    rating: movie.rating,
    bannerUrl: movie.bannerUrl,
    trailerUrl: movie.trailerUrl,
    description: movie.description,
    categories: movie.genres ? movie.genres.map(g => ({ categoryName: g.name })) : []
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
