import { Routes, Route, Navigate } from 'react-router-dom'
import ViewListOfScreeningMovies from './pages/ViewListOfScreeningMovies'
import MovieScheduleDetail from './pages/MovieScheduleDetail'

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff/movies" replace />} />
      <Route path="/staff/movies/:movieId" element={<MovieScheduleDetail />} />
      <Route path="/staff/movies" element={<ViewListOfScreeningMovies />} />
    </Routes>
  )
}

export default StaffRoutes